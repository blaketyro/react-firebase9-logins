import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "react-bootstrap/Toast";
import { createPortal } from "react-dom";

// TODO!!!? msTime optional? don't want to constantly render if unneeded
type ToastComponent = ({ id, close }: { id: number; close: () => void }) => ReactNode;

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
	toasts: ReadonlyMap<number, ToastComponent>;
	setToasts: Dispatch<SetStateAction<ReadonlyMap<number, ToastComponent>>>;
}>({
	toasts: new Map(),
	setToasts: () => null,
});

const ToastPortal = ({ toasts }: { toasts: ReadonlyMap<number, ToastComponent> }) => {
	const toastPortal = document.getElementById("toast-portal");
	const closeToast = useCloseToast();
	return (
		toastPortal &&
		createPortal(
			Array.from(toasts.entries())
				.reverse() // Reverse so later toasts are at the top.
				.map(([id, ToastComponent], index) => (
					<ToastComponent key={index} id={id} close={() => closeToast(id)} />
				)),
			toastPortal
		)
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const toastState = useState<ReadonlyMap<number, ToastComponent>>(new Map());
	const toastValue = useMemo(() => ({ toasts: toastState[0], setToasts: toastState[1] }), [toastState]);
	return (
		<ToastContext.Provider value={toastValue}>
			{children}
			<ToastPortal toasts={toastValue.toasts} />
		</ToastContext.Provider>
	);
};

let toastIdCounter = 0; // Having an outside variable feels weird but toasts were inconsistent when I tried with a ref.
export const useMakeToastMaker = () => {
	// const toastIdCounter = useRef(0);
	const { setToasts } = useContext(ToastContext);
	const closeToast = useCloseToast();

	// Return a function that can be called to make a "makeToast" function.
	return useCallback((ToastComponent: ToastComponent, timeoutMs: number) => {
		// TODO!!! the ids and timeouts don't always stay in sync?
		// The 2 lines below could perhaps be moved to inside the setToasts function. When using a ref for
		// toastIdCounter they *have* to be in there or else toasts get really out of order for some reason.
		// But as is, with the `let toastIdCounter`, where the 2 lines is should be fine and imo makes more sense.
		const id = toastIdCounter++; // toastIdCounter.current++;
		setTimeout(() => closeToast(id), timeoutMs);
		setToasts((oldToasts) => {
			const newToasts = new Map(oldToasts);
			newToasts.set(id, ToastComponent);
			return newToasts;
		});
	}, []);
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
export const useMakeBootstrapToast = () => {
	const makeToastMaker = useMakeToastMaker();
	return (
		// TODO!!! msLeft as function input too??
		message?: PossibleFunctionOf<string, { id: number }>,
		title?: PossibleFunctionOf<string, { id: number }>,
		variant?: BootstrapVariant,
		timeoutMs = 3000
	) => {
		return makeToastMaker(({ id, close }) => {
			const concreteMessage = callPossibleFunction(message, { id });
			const concreteTitle = callPossibleFunction(title, { id });
			return (
				<Toast onClose={close} bg={variant}>
					{title ? (
						<Toast.Header className="fw-bold d-flex justify-content-between">{concreteTitle}</Toast.Header>
					) : (
						<Toast.Header className="d-flex justify-content-end"></Toast.Header>
					)}
					{concreteMessage && <Toast.Body>{concreteMessage}</Toast.Body>}
				</Toast>
			);
		}, timeoutMs);
	};
};

//#endregion
