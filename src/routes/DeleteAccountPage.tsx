import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { deleteUserHelper } from "../accountHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const DeleteAccountPage = () => {
	const makeToast = useMakeToast();
	const navigate = useNavigate();

	return (
		<Box>
			<h3>Delete Account</h3>
			<SignInGuard requireSignIn>
				<p>
					Click the button below to permanently delete your account. You can re-create an account with the
					same email address later.
				</p>
				<Button
					variant="danger"
					onClick={() => {
						void (async () => {
							await deleteUserHelper(makeToast);
							navigate("/");
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
