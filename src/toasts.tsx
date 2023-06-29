import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "react-bootstrap/Toast";
import { createPortal } from "react-dom";

type ToastArgs = { id: number; msLeft: number };
type ToastComponent = ({ id, msLeft, close }: ToastArgs & { close: () => void }) => ReactNode;
type ToastData = { msLeft: number; ToastComponent: ToastComponent };

const useCloseToast = () => {
	const { setToasts } = useContext(ToastContext);
	return useCallback(
		(id: number) => {
			setToasts((oldToasts) => {
				if (!oldToasts.has(id)) return oldToasts;
				const newToasts = new Map(oldToasts);
				newToasts.delete(id);
				return newToasts;
			});
		},
		[setToasts]
	);
};

const ToastContext = createContext<{
	toasts: ReadonlyMap<number, ToastData>;
	setToasts: Dispatch<SetStateAction<ReadonlyMap<number, ToastData>>>;
}>({
	toasts: new Map(),
	setToasts: () => null,
});

const ToastPortal = ({ toasts }: { toasts: ReadonlyMap<number, ToastData> }) => {
	const toastPortal = document.getElementById("toast-portal");
	const closeToast = useCloseToast();
	return (
		toastPortal &&
		createPortal(
			Array.from(toasts.entries())
				.reverse() // Reverse so later toasts are at the top.
				.map(([id, { msLeft, ToastComponent }], key) => (
					<ToastComponent key={key} id={id} msLeft={msLeft} close={() => closeToast(id)} />
				)),
			toastPortal
		)
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const toastState = useState<ReadonlyMap<number, ToastData>>(new Map());
	const toastValue = useMemo(() => ({ toasts: toastState[0], setToasts: toastState[1] }), [toastState]);
	return (
		<ToastContext.Provider value={toastValue}>
			{children}
			<ToastPortal toasts={toastValue.toasts} />
		</ToastContext.Provider>
	);
};

const defaultTimeoutMs = 3000;
const defaultIntervalMs = 10;
let toastIdCounter = 0; // Having an outside variable feels weird but toasts were inconsistent when I tried with a ref.
export const useMakeToastMaker = () => {
	// const toastIdCounter = useRef(0);
	const { setToasts } = useContext(ToastContext);
	const closeToast = useCloseToast();

	// Return a function that can be called to make a "makeToast" function.
	return useCallback(
		(
			ToastComponent: ToastComponent,
			timeoutMs = defaultTimeoutMs,
			intervalMs: number | null = defaultIntervalMs
		) => {
			const id = toastIdCounter++; // toastIdCounter.current++;

			setToasts((oldToasts) => {
				const newToasts = new Map(oldToasts);
				newToasts.set(id, { msLeft: timeoutMs, ToastComponent });
				return newToasts;
			});

			let intervalId = 0; // Allow for interval-less toasts by passing null to intervalMs.
			if (intervalMs !== null) {
				intervalId = window.setInterval(() => {
					// All this `new Map` stuff feels inefficient, but in practice there's only a few toasts at once.
					setToasts((oldToasts) => {
						// Update the msLeft of this particular toast.
						const currentToast = oldToasts.get(id);
						if (!currentToast) return oldToasts;
						const newToasts = new Map(oldToasts);
						newToasts.set(id, { ...currentToast, msLeft: currentToast.msLeft - intervalMs });
						return newToasts;
					});
				}, intervalMs);
			}

			// Having a separate setTimeout ensures the toast will close at the right time regardless of intervalMs.
			window.setTimeout(() => {
				if (intervalMs !== null) {
					window.clearInterval(intervalId);
				}
				closeToast(id);
			}, timeoutMs); // Should this timeout ever be cleared? Don't think so but where and how would it happen?
		},
		[setToasts, closeToast]
	);
};

//#region Bootstrap Specific Toast Code:

type FunctionOf<TReturn, TArg> = (arg: TArg) => TReturn;
type PossibleFunctionOf<TReturn, TArg> = TReturn | FunctionOf<TReturn, TArg>;
const isFunction = <T, TArg>(thing: PossibleFunctionOf<T, TArg>): thing is FunctionOf<T, TArg> => {
	return typeof thing === "function";
};
const callPossibleFunction = <TReturn, TArg>(possibleFunction: PossibleFunctionOf<TReturn, TArg>, arg: TArg) => {
	return isFunction(possibleFunction) ? possibleFunction(arg) : possibleFunction;
};

export type BootstrapVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";

const BootstrapToast = ({
	message,
	title,
	variant,
	close,
}: {
	message?: string;
	title?: string;
	variant?: BootstrapVariant;
	close: () => void;
}) => (
	// Intentionally not using Bootstrap's built in delay and autohide.
	<Toast onClose={close} bg={variant}>
		{title ? (
			<Toast.Header className="fw-bold d-flex justify-content-between">{title}</Toast.Header>
		) : (
			<Toast.Header className="d-flex justify-content-end"></Toast.Header>
		)}
		{message && <Toast.Body>{message}</Toast.Body>}
	</Toast>
);

export const useMakeBootstrapToast = () => {
	const makeToastMaker = useMakeToastMaker();
	return (
		message?: PossibleFunctionOf<string, ToastArgs>,
		title?: PossibleFunctionOf<string, ToastArgs>,
		variant?: BootstrapVariant,
		timeoutMs?: number
	) => {
		return makeToastMaker(
			({ id, msLeft, close }) => (
				<BootstrapToast
					message={callPossibleFunction(message, { id, msLeft })}
					title={callPossibleFunction(title, { id, msLeft })}
					variant={variant}
					close={close}
				/>
			),
			timeoutMs
			// 100 null <-- Can play with intervalMs here.
		);
	};
};

//#endregion
