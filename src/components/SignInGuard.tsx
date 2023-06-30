import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { signOutHelper } from "../accountHelpers";
import { useUser } from "../accounts";
import { useMakeToast } from "../toasts";

const SignInGuard = ({ children, requireSignIn }: { children: ReactNode; requireSignIn?: boolean }) => {
	const user = useUser();
	const makeToast = useMakeToast();

	if (requireSignIn) {
		return user ? (
			children
		) : (
			<>
				<p className="mb-1">You must be signed in to use this page.</p>
				<p className="mt-1">
					<Link to="/sign-in">Sign in here</Link> or <Link to="/sign-up">create an account here</Link>.
				</p>
			</>
		);
	}

	return user ? (
		<>
			<p className="mb-1 ">
				You are already signed in as <span className="text-info">{user.email}</span>.
			</p>
			<p className="mt-1">
				Return to the <Link to="/">homepage</Link> or sign out to proceed.
			</p>
			<Button variant="secondary" size="sm" onClick={() => void signOutHelper(makeToast)}>
				Sign Out
			</Button>
		</>
	) : (
		children
	);
};

export default SignInGuard;
