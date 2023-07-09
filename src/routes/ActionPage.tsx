// The OOB (out of band) action page handles OOB codes that come from things like email verifications and password
// resets. It is not normally linked or accessible from anywhere on the rest of the site. Firebase has its own
// default UI to do these things (/__/auth/action?mode=...&oobCode=...) but it can be customized by changing the
// Action URLs in the auth email templates. That's what this page is for - to provide custom UI for OOB actions
// using custom Action URL of "https://react-firebase9-logins.firebaseapp.com/action".
// Templates: https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
// Search params format: .../action?mode=...&oobCode=...&apiKey=...&continueUrl=...&lang=en

import { ReactNode, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthErrorCodes, confirmPasswordReset, confirmVerificationEmail, getOobCodeInfo, getOrigin } from "../auth";
import Box from "../components/Box";
import HomeLink from "../components/HomeLink";
import { useMakeToast } from "../toast";

const actionComponents: Record<string, ({ searchParams }: { searchParams: URLSearchParams }) => ReactNode> = {
	unknown: () => <>Unknown action</>,
	verifyEmail: ({ searchParams }) => {
		const oobCode = searchParams.get("oobCode") ?? "";
		const continueUrl = searchParams.get("continueUrl") ?? getOrigin();

		const [status, setStatus] = useState<null | string>(); // undefined=loading, null=success, string=error

		useEffect(() => {
			void (async () => {
				switch (await confirmVerificationEmail(oobCode)) {
					case undefined:
						setStatus(null);
						break;
					case AuthErrorCodes.InvalidActionCode:
						setStatus("Invalid action code");
						break;
					case AuthErrorCodes.ExpiredActionCode:
						setStatus("Link is expired - please try again");
						break;
					case AuthErrorCodes.UserNotFound:
						setStatus("User not found - possibly deleted");
						break;
					default:
						setStatus("Unspecified error confirming email verification");
				}
			})();
		}, []);

		return status === undefined ? (
			<>Loading...</>
		) : typeof status === "string" ? (
			<>{status}</>
		) : (
			<Stack gap={2}>
				<div>Your email address has been verified!</div>
				<Link to={continueUrl}>Continue to the site</Link>
			</Stack>
		);
	},
	resetPassword: ({ searchParams }) => {
		const oobCode = searchParams.get("oobCode") ?? "";
		const continueUrl = searchParams.get("continueUrl") ?? getOrigin();
		const makeToast = useMakeToast();
		const navigate = useNavigate();

		const [password, setPassword] = useState("");
		const [passwordConfirmation, setPasswordConfirmation] = useState("");

		const [status, setStatus] = useState<null | string>(); // undefined=loading, null=success, string=error
		const [email, setEmail] = useState<string>();

		useEffect(() => {
			void (async () => {
				const info = await getOobCodeInfo(oobCode);

				if (typeof info === "object") {
					setStatus(null);
					setEmail(info.data.email ?? undefined);
					return;
				}
				switch (info) {
					case AuthErrorCodes.InvalidActionCode:
						setStatus("Invalid action code");
						break;
					case AuthErrorCodes.ExpiredActionCode:
						setStatus("Link is expired - please try again");
						break;
					case AuthErrorCodes.UserNotFound:
						setStatus("User not found - possibly deleted");
						break;
					default:
						setStatus("Unspecified error resetting password");
				}
			})();
		}, []);

		return status === undefined ? (
			<>Loading...</>
		) : typeof status === "string" ? (
			<>{status}</>
		) : (
			<>
				<h3>Reset Password</h3>
				{email && (
					<p>
						For <span className="text-info">{email}</span>
					</p>
				)}
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Resetting Password", "danger");
							switch (await confirmPasswordReset(oobCode, password, passwordConfirmation)) {
								case undefined:
									setPassword("");
									setPasswordConfirmation("");
									makeToast("Successfully reset password!", "Reset Password", "success");
									navigate(continueUrl);
									break;
								case AuthErrorCodes.ExpiredActionCode:
									makeErrorToast("Action expired - please try again from the start");
									break;
								case AuthErrorCodes.MissingPassword:
									makeErrorToast("No password provided");
									break;
								case AuthErrorCodes.WeakPassword:
									makeErrorToast("Password must be at least 6 characters");
									break;
								case AuthErrorCodes.UnconfirmedPassword:
									makeErrorToast("Passwords don't match");
									break;
								case AuthErrorCodes.TooManyRequests:
									makeErrorToast("Too many requests - try again later");
									break;
								default:
									setPassword("");
									setPasswordConfirmation("");
									makeErrorToast("Unspecified error resetting password");
							}
						})();
					}}
				>
					<Stack gap={2}>
						<Form.Control
							name="new-password"
							type="password"
							autoComplete="new-password"
							placeholder="New Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Form.Control
							name="confirm-new-password"
							type="password"
							autoComplete="new-password"
							placeholder="Confirm New Password"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
						/>
						<Button type="submit">Reset Password</Button>
					</Stack>
				</Form>
			</>
		);
	},
};

const ActionPage = () => {
	const [searchParams] = useSearchParams();
	const mode = searchParams.get("mode");
	const ActionComponent = mode && mode in actionComponents ? actionComponents[mode] : actionComponents.unknown;

	return (
		<Box>
			<ActionComponent searchParams={searchParams} />
			<HomeLink />
		</Box>
	);
};

export default ActionPage;
