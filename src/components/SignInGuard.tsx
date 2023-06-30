import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { signOutWithToasts, useUser } from "../accounts";
import { useMakeToast } from "../toasts";

const SignInGuard = ({ children, requireSignIn }: { children: ReactNode; requireSignIn?: boolean }) => {
	const user = useUser();
	const makeToast = useMakeToast();

	if (requireSignIn) {
		return user ? (
			children
		) : (
			<Stack gap={2}>
				<div>You must be signed in to use this page.</div>
				<div>
					<Link to="/sign-in">Sign in here</Link> or <Link to="/sign-up">create an account here</Link>.
				</div>
			</Stack>
		);
	}

	return user ? (
		<Stack gap={2}>
			<div>You are already signed in as {user.email}.</div>
			<div>
				Return to the <Link to="/">homepage</Link> or sign out to proceed.
			</div>
			<Button variant="secondary" size="sm" onClick={() => signOutWithToasts(makeToast)}>
				Sign Out
			</Button>
		</Stack>
	) : (
		children
	);
};

export default SignInGuard;
