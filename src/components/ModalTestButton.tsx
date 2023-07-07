import Button from "react-bootstrap/Button";
import { useMakeModal } from "../modal";

const ModalTestButton = () => {
	const makeModal = useMakeModal();
	return (
		<Button
			size="sm"
			style={{ minWidth: "9rem" }}
			variant="light"
			onClick={() => {
				makeModal("Test Modal", ({ close }) => (
					<>
						<p>This is a modal! You can click outside or hit ESC to exit.</p>
						<Button onClick={() => close("ok")}>Ok</Button>
					</>
				));
			}}
		>
			Modal Test
		</Button>
	);
};

export default ModalTestButton;
