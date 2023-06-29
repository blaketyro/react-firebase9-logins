import Button from "react-bootstrap/Button";
import { BootstrapVariant, useMakeBootstrapToast } from "../toasts";

const ToastTestButton = ({ variant, timeoutMs }: { variant: BootstrapVariant; timeoutMs: number }) => {
	const makeToast = useMakeBootstrapToast();
	return (
		<Button
			size="sm"
			style={{ minWidth: "9rem" }}
			variant={variant}
			onClick={() =>
				makeToast(
					// Message is rudimentary text progress bar. With this toast system a proper graphical one is easy!
					({ msLeft }) =>
						`Closing in ${(msLeft / 1000).toFixed(2)}s ` +
						".".repeat(Math.floor((58 * msLeft) / timeoutMs)),
					({ id }) => `🔥🍞 Toast Test ${id}`,
					variant,
					timeoutMs
				)
			}
		>
			Toast Test {timeoutMs}ms
		</Button>
	);
};

export default ToastTestButton;
