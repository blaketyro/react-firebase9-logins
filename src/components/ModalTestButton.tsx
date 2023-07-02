import Button from "react-bootstrap/Button";
import { useOpenModal } from "../modal";

const ModalTestButton = () => {
	const openModal = useOpenModal();
	return (
		<Button
			size="sm"
			style={{ minWidth: "9rem" }}
			variant="light"
			onClick={() => {
				openModal(
					"Test Modal",
					<p>
						This...
						<br />
						<br />
						<br />
						...is a modal!
					</p>
				);
			}}
		>
			Modal Test
		</Button>
	);
};

export default ModalTestButton;
