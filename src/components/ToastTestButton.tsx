import Button from "react-bootstrap/Button";
import { BootstrapVariant, useMakeToast } from "../toast";

const ToastTestButton = ({ variant, timeoutMs }: { variant: BootstrapVariant; timeoutMs: number }) => {
	const makeToast = useMakeToast();
	return (
		<Button
			size="sm"
			style={{ minWidth: "9rem" }}
			variant={variant}
			onClick={() =>
				makeToast(
					// Message is rudimentary text progress bar. With this toast system a proper graphical one is easy!
					({ remainingMs }) => {
						if (remainingMs === Infinity) return "Endless";
						return (
							`Closing in ${(remainingMs / 1000).toFixed(2)}s ` +
							".".repeat(Math.floor((58 * remainingMs) / timeoutMs)) // 58 periods about fills the box.
						);
					},
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
