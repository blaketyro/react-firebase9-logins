import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { signOutWithToasts, useUser } from "../accounts";
import { useMakeToast } from "../toasts";

const AlreadySignedInGuard = ({ children }: { children: ReactNode }) => {
	const user = useUser();
	const makeToast = useMakeToast();

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

export default AlreadySignedInGuard;
