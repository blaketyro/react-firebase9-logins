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

export type BootstrapVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
type ToastData = {
	id: number;
	message: string;
	title?: string;
	variant?: BootstrapVariant;
};
const defaultTimeoutMs = 3000;

const ToastContext = createContext<{ toastData: ToastData[]; setToastData: Dispatch<SetStateAction<ToastData[]>> }>({
	toastData: [],
	setToastData: () => null,
});

const ToastWithData = ({
	toastData: { id, message, title, variant },
	closeToast,
}: {
	toastData: ToastData;
	closeToast: (id: number) => void;
}) => (
	// Can't use Bootstrap's built-in delay and autohide props because the re-rendering throws it off.
	<Toast onClose={() => closeToast(id)} bg={variant}>
		{title ? (
			<Toast.Header className="fw-bold d-flex justify-content-between">{title}</Toast.Header>
		) : (
			<Toast.Header className="d-flex justify-content-end"></Toast.Header>
		)}
		{message && <Toast.Body>{message}</Toast.Body>}
	</Toast>
);

export const useMakeToast = () => {
	const { setToastData } = useContext(ToastContext);
	const toastId = useRef(0); // Since the indexes are always changing, use an incrementing id to identify toasts.

	const closeToast = useCloseToast();
	return (message: string, options?: Partial<{ title: string; timeoutMs: number; variant: BootstrapVariant }>) => {
		setToastData((oldToastData) => {
			const id = toastId.current++;
			setTimeout(() => {
				closeToast(id);
			}, options?.timeoutMs ?? defaultTimeoutMs);
			return [{ ...options, message, id }, ...oldToastData];
		});
	};
};

const useCloseToast = () => {
	const { setToastData } = useContext(ToastContext);
	return useCallback(
		(id: number) => {
			setToastData((oldToastData) => {
				// A Map<number, ToastData> could be used instead of ToastData[] to avoid the O(n) findIndex call,
				// but there are usually so few toasts and so much O(n) stuff in the render anyway
				// it would almost certainly not be be worth the overhead (and the slightly messier code).
				const index = oldToastData.findIndex((toastData) => id === toastData.id);
				if (index === -1) return oldToastData;
				const newToastData = [...oldToastData];
				newToastData.splice(index, 1);
				return newToastData;
			});
		},
		[setToastData]
	);
};

const ToastPortal = ({ toastData }: { toastData: ToastData[] }) => {
	const toastPortal = document.getElementById("toast-portal");
	const closeToast = useCloseToast();
	return (
		toastPortal &&
		createPortal(
			toastData.map((toastData, index) => (
				<ToastWithData key={index} toastData={toastData} closeToast={closeToast} />
			)),
			toastPortal
		)
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const toastState = useState<ToastData[]>([]);
	const toastValue = useMemo(() => ({ toastData: toastState[0], setToastData: toastState[1] }), [toastState]);
	return (
		<ToastContext.Provider value={toastValue}>
			{children}
			<ToastPortal toastData={toastValue.toastData} />
		</ToastContext.Provider>
	);
};
