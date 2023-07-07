import Button from "react-bootstrap/Button";
import { signOutHelper } from "../accountHelpers";
import { useUser } from "../accounts";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const SignOutPage = () => {
	const user = useUser();
	const makeToast = useMakeToast();
	return (
		<Box>
			<h3>Sign Out</h3>
			<SignInGuard requireSignIn>
				<p>
					You are signed in as <span className="text-info">{user?.email}</span>.
				</p>
				<p>Click the button below to sign out of this app.</p>
				<Button variant="secondary" onClick={() => void signOutHelper(makeToast)}>
					Sign Out
				</Button>
			</SignInGuard>
		</Box>
	);
};

export default SignOutPage;
