import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { deleteUserHelper } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeModal } from "../modal";
import { useMakeToast } from "../toast";

const DeleteAccountPage = () => {
	const navigate = useNavigate();
	const makeToast = useMakeToast();
	const makeModal = useMakeModal();

	return (
		<Box>
			<h3>Delete Account</h3>
			<SignInGuard mode="require-signed-in">
				<p>
					Click the button below to delete your account. You will be required to reenter your password. You
					can create an account again later with the same email address.
				</p>
				<Button
					variant="danger"
					onClick={() => {
						void (async () => {
							if (await deleteUserHelper(makeToast, makeModal, true)) {
								navigate("/");
							}
						})();
					}}
				>
					Delete Account
				</Button>
			</SignInGuard>
		</Box>
	);
};

export default DeleteAccountPage;
