import Button from "react-bootstrap/Button";
import { useOpenFullscreenModal } from "../modal";

const ModalTestButton = () => {
	const openModal = useOpenFullscreenModal();
	return (
		<Button
			size="sm"
			style={{ minWidth: "9rem" }}
			variant="light"
			onClick={() => {
				openModal(({ close }) => {
					// TODO Use Bootstrap
					return <button onClick={close}>MODAL TEST {Math.random()}</button>;
				});
			}}
		>
			Modal Test
		</Button>
	);
};

export default ModalTestButton;
