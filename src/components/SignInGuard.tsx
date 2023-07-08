import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { useUser } from "../auth";
import { signOutHelper } from "../authHelpers";
import { useMakeToast } from "../toast";

const SignInGuard = ({ children, mode }: { children: ReactNode; mode: "require-signed-in" | "require-signed-out" }) => {
	const user = useUser();
	const makeToast = useMakeToast();

	if (mode === "require-signed-in") {
		return user ? (
			children
		) : (
			<>
				<p className="mb-1">You must be signed in to use this page.</p>
				<p className="mt-1">
					<Link to="/sign-in">Sign in here</Link> or <Link to="/sign-up">create an account here</Link>, or
					return to the <Link to="/">homepage</Link>.
				</p>
			</>
		);
	} else {
		return user ? (
			<>
				<p className="mb-1 ">
					You must be signed out to use this page. You are signed in as{" "}
					<span className="text-info">{user.email}</span>.
				</p>

				<p className="mt-1">
					Sign out to proceed or return to the <Link to="/">homepage</Link>.
				</p>
				<Button variant="secondary" onClick={() => void signOutHelper(makeToast)}>
					Sign Out
				</Button>
			</>
		) : (
			children
		);
	}
};

export default SignInGuard;
