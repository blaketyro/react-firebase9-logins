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
				makeModal("Test Modal", () => (
					<p>
						This...
						<br />
						<br />
						<br />
						...is a modal!
					</p>
				));
			}}
		>
			Modal Test
		</Button>
	);
};

export default ModalTestButton;
