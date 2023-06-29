import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "react-bootstrap/Toast";
import { createPortal } from "react-dom";

export const defaultToastPortalId = "toast-portal";
export const defaultToastTimeoutMs = 2500;
export const defaultToastIntervalMs = 10;

type ToastData = { ToastComponent: ToastComponent; timeoutMs: number; currentMs: number };
type ToastArgs = { id: number; timeoutMs: number; currentMs: number; remainingMs: number };
type ToastComponent = (props: ToastArgs & { close: () => void }) => ReactNode;

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

const ToastPortal = ({ toasts, toastPortalId }: { toasts: ReadonlyMap<number, ToastData>; toastPortalId: string }) => {
	const toastPortal = document.getElementById(toastPortalId);
	const closeToast = useCloseToast();
	return (
		toastPortal &&
		createPortal(
			Array.from(toasts.entries())
				.reverse() // Reverse so later toasts are at the top.
				.map(([id, { ToastComponent, timeoutMs, currentMs }], key) => {
					const remainingMs = timeoutMs - currentMs;
					return (
						<ToastComponent
							{...{ key, id, timeoutMs, currentMs, remainingMs, close: () => closeToast(id) }}
						/>
					);
				}),
			toastPortal
		)
	);
};

export const ToastProvider = ({
	children,
	toastPortalId = defaultToastPortalId,
}: {
	children: ReactNode;
	toastPortalId?: string;
}) => {
	const toastState = useState<ReadonlyMap<number, ToastData>>(new Map());
	const toastValue = useMemo(() => ({ toasts: toastState[0], setToasts: toastState[1] }), [toastState]);
	return (
		<ToastContext.Provider value={toastValue}>
			{children}
			<ToastPortal toasts={toastValue.toasts} toastPortalId={toastPortalId} />
		</ToastContext.Provider>
	);
};

let toastIdCounter = 0; // Having an outside variable feels weird but toasts were inconsistent when I tried with a ref.
export const useMakeToastMaker = () => {
	// const toastIdCounter = useRef(0);
	const { setToasts } = useContext(ToastContext);
	const closeToast = useCloseToast();

	// Return a function that can be called to make a "makeToast" function.
	return useCallback(
		(
			ToastComponent: ToastComponent,
			timeoutMs = defaultToastTimeoutMs,
			intervalMs = defaultToastIntervalMs
			// Endless or interval-less toasts are possible by passing Infinity to timeoutMs or intervalMs.
		) => {
			const id = ++toastIdCounter; // ++toastIdCounter.current;

			setToasts((oldToasts) => {
				const newToasts = new Map(oldToasts);
				newToasts.set(id, { ToastComponent, timeoutMs, currentMs: 0 });
				return newToasts;
			});

			let intervalId = 0;
			if (intervalMs !== Infinity) {
				intervalId = window.setInterval(() => {
					// All this `new Map` stuff feels inefficient, but in practice there's only a few toasts at once.
					setToasts((oldToasts) => {
						// Update the msLeft of this particular toast.
						const currentToast = oldToasts.get(id);
						if (!currentToast) return oldToasts;
						const newToasts = new Map(oldToasts);
						newToasts.set(id, { ...currentToast, currentMs: currentToast.currentMs + intervalMs });
						return newToasts;
					});
				}, intervalMs);
			}

			if (timeoutMs !== Infinity) {
				// Having a separate setTimeout ensures the toast will close at the right time regardless of intervalMs.
				window.setTimeout(() => {
					if (intervalMs !== Infinity) {
						window.clearInterval(intervalId);
					}
					closeToast(id);
				}, timeoutMs); // Should this timeout ever be cleared? Don't think so but where and how would it happen?
			}
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
	opacity,
	close,
}: {
	message?: string;
	title?: string;
	variant?: BootstrapVariant;
	opacity: number;
	close: () => void;
}) => (
	// Intentionally not using Bootstrap's built in delay and autohide.
	<Toast onClose={close} bg={variant} style={{ opacity }}>
		{title ? (
			<Toast.Header className="fw-bold d-flex justify-content-between">{title}</Toast.Header>
		) : (
			<Toast.Header className="d-flex justify-content-end"></Toast.Header>
		)}
		{message && <Toast.Body>{message}</Toast.Body>}
	</Toast>
);

export const useMakeToast = () => {
	const makeToastMaker = useMakeToastMaker();
	return (
		message?: PossibleFunctionOf<string, ToastArgs>,
		title?: PossibleFunctionOf<string, ToastArgs>,
		variant?: BootstrapVariant,
		timeoutMs?: number
	) => {
		return makeToastMaker(
			({ id, timeoutMs, currentMs, remainingMs, close }) => (
				// Things break for some reason when close gets directly sent to the callPossibleFunction calls.
				// So split everything up creating new new objects `{ id, timeoutMs, currentMs, remainingMs }`.
				<BootstrapToast
					message={callPossibleFunction(message, { id, timeoutMs, currentMs, remainingMs })}
					title={callPossibleFunction(title, { id, timeoutMs, currentMs, remainingMs })}
					variant={variant}
					close={close}
					opacity={remainingMs && remainingMs >= 100 ? 1 : 2}
				/>
			),
			timeoutMs, // <-- Can put Infinity here to make toasts endless.
			100 // 100 Infinity <-- Can play with intervalMs here.
		);
	};
};

//#endregion
