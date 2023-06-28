import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext<[toasts: ReactNode[], setToasts: Dispatch<SetStateAction<ReactNode[]>>]>([
	[],
	() => null,
]);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const toastState = useState<ReactNode[]>([]);

	const toastElement = document.getElementById("toast-portal");

	return (
		<ToastContext.Provider value={toastState}>
			{toastElement && createPortal(toastState[0], toastElement)}
			{children}
		</ToastContext.Provider>
	);
};

export const useShowToast = () => {
	const [, setToasts] = useContext(ToastContext);

	return (message: ReactNode) => {
		setToasts((oldToasts) => {
			return [...oldToasts, <p>{message}</p>];
		});
	};
};
