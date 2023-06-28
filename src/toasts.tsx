import {
	Dispatch,
	ReactNode,
	SetStateAction,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import Toast from "react-bootstrap/Toast";
import { createPortal } from "react-dom";

type BootstrapVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
type ToastData = {
	id: number;
	message: string;
	title?: string;
	timeoutMs?: number;
	variant?: BootstrapVariant;
};
const defaultTimeoutMs = 3000;

const ToastContext = createContext<{ toastData: ToastData[]; setToastData: Dispatch<SetStateAction<ToastData[]>> }>({
	toastData: [],
	setToastData: () => null,
});

const ToastWithData = ({
	toastData: { id, message, title, timeoutMs, variant },
	closeToast,
}: {
	toastData: ToastData;
	closeToast: (id: number) => void;
}) => {
	return (
		// Can't use Bootstrap's built-in onClose and autohide because the re-rendering throws it off.
		<Toast
			onClose={() => {
				console.log("clicked to close", id);
				closeToast(id);
			}}
			bg={variant}
			// delay={timeoutMs ?? defaultTimeoutMs}
			// autohide
		>
			{title ? (
				<Toast.Header className="fw-bold d-flex justify-content-between">{title}</Toast.Header>
			) : (
				<Toast.Header className="d-flex justify-content-end"></Toast.Header>
			)}
			{message && <Toast.Body>{message}</Toast.Body>}
		</Toast>
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toastData, setToastData] = useState<ToastData[]>([]);
	const toastState = useMemo(() => ({ toastData, setToastData }), [toastData]);
	const toastPortal = document.getElementById("toast-portal");

	const closeToast = (id: number) => {
		setToastData((oldToastData) => {
			const index = oldToastData.findIndex((toastData) => id === toastData.id);
			console.log("closing id", id, index, oldToastData);
			if (index === -1) return oldToastData;
			const newToastData = [...oldToastData];
			newToastData.splice(index, 1);
			return newToastData;
		});
	};

	return (
		<ToastContext.Provider value={toastState}>
			{toastPortal &&
				createPortal(
					toastData.map((toastData, index) => (
						<ToastWithData key={index} toastData={toastData} closeToast={closeToast} />
					)),
					toastPortal
				)}
			{children}
		</ToastContext.Provider>
	);
};

const useCloseToast = () => {
	const { setToastData } = useContext(ToastContext);
	return useCallback((id: number) => {
		setToastData((oldToastData) => {
			const index = oldToastData.findIndex((toastData) => id === toastData.id);
			console.log("closing id", id, index, oldToastData);
			if (index === -1) return oldToastData;
			const newToastData = [...oldToastData];
			newToastData.splice(index, 1);
			return newToastData;
		});
	}, []);
};

export const useShowToast = () => {
	const { setToastData } = useContext(ToastContext);
	const toastId = useRef(0); // Since the indexes are always changing, use an incrementing id to identify toasts.

	const closeToast = useCloseToast();
	return (message: string, options?: Partial<{ title: string; timeoutMs: number; variant: BootstrapVariant }>) => {
		setToastData((oldToastData) => {
			const id = toastId.current++;
			setTimeout(() => {
				closeToast(id);
			}, options?.timeoutMs ?? defaultTimeoutMs);
			console.log("Making toast", id);
			return [...oldToastData, { ...options, message, id }];
		});
	};
};
