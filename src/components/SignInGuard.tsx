import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { useUser } from "../auth";
import { signOutHelper } from "../authHelpers";
import { useMakeToast } from "../toast";
import HomeLink from "./HomeLink";

const SignInGuard = ({ children, mode }: { children: ReactNode; mode: "require-signed-in" | "require-signed-out" }) => {
	const user = useUser();
	const makeToast = useMakeToast();

	if (mode === "require-signed-in") {
		return user ? (
			children
		) : (
			<Stack gap={2}>
				<div>You must be signed in to use this page.</div>
				<div>
					<Link to="/sign-in">Sign in here</Link> or <Link to="/sign-up">create an account here</Link>.
				</div>
				<HomeLink />
			</Stack>
		);
	} else {
		return user ? (
			<Stack gap={2}>
				<div>
					You must be signed out to use this page. You are signed in as{" "}
					<span className="text-info">{user.email}</span>.
				</div>
				<Button variant="secondary" onClick={() => void signOutHelper(makeToast)}>
					Sign Out
				</Button>
				<HomeLink />
			</Stack>
		) : (
			children
		);
	}
};

export default SignInGuard;
