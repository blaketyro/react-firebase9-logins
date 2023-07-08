import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { AuthErrorCodes, getOrigin, sendPasswordResetEmail } from "../auth";
import { exampleEmail } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

// TODO!!! Page works but can be better:
// Customize email template https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
// especially the action url so it goes to something different than https://react-firebase9-logins.firebaseapp.com/__/auth/action
// and then use the oobCode (out of band) in the url to call https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#confirmpasswordreset
// (https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#verifypasswordresetcode may be useful too?)

const ForgotPasswordPage = () => {
	const makeToast = useMakeToast();
	const [email, setEmail] = useState("");

	return (
		<Box>
			<h3>Forgot Password</h3>
			<SignInGuard mode="require-signed-out">
				<p>
					Enter your email address and click the button below and instructions for resetting your password
					will be emailed to you.
				</p>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							if (email === exampleEmail) {
								makeToast("Not sending email to example email address", "Didn't Send Email");
								return;
							}

							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Sending Email", "danger");
							switch (await sendPasswordResetEmail(email, getOrigin("/sign-in"))) {
								case null:
									makeToast("Sent password reset email", "Sent Email", "success");
									break;
								case AuthErrorCodes.InvalidEmail:
									makeErrorToast("Invalid email address");
									break;
								case AuthErrorCodes.UserNotFound:
									makeErrorToast("User not found");
									break;
								case AuthErrorCodes.TooManyRequests:
									makeErrorToast("Too many requests - try again later");
									break;
								default:
									makeErrorToast("Unspecified error sending password reset email");
							}
						})();
					}}
				>
					<Stack gap={2}>
						<Form.Control
							name="email"
							type="email"
							autoComplete="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Button type="submit">Send Password Reset Email</Button>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default ForgotPasswordPage;
