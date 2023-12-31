import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { AuthErrorCodes, signUp, useUser } from "../auth";
import { exampleEmail, examplePassword } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const SignUpPage = () => {
	const user = useUser();
	const makeToast = useMakeToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	return (
		<Box>
			<h3
				onClick={() => {
					if (!user) {
						setEmail(exampleEmail);
						setPassword(examplePassword);
						setPasswordConfirmation(examplePassword);
					}
				}}
			>
				Sign Up
			</h3>
			<SignInGuard mode="require-signed-out">
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Signing Up", "danger");
							// Debatable when exactly which textboxes should be cleared.
							switch (await signUp(email, password, passwordConfirmation)) {
								case undefined:
									setEmail("");
									setPassword("");
									setPasswordConfirmation("");
									makeToast("Successfully signed up!", "Signed Up", "success");
									navigate("/");
									break;
								case AuthErrorCodes.EmailAlreadyInUse:
									makeErrorToast("That email already has an account");
									break;
								case AuthErrorCodes.MissingEmail:
									makeErrorToast("No email provided");
									break;
								case AuthErrorCodes.InvalidEmail:
									makeErrorToast("Invalid email address");
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
									setEmail("");
									setPassword("");
									setPasswordConfirmation("");
									makeErrorToast("Unspecified error signing in");
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
						<Form.Control
							size="sm"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Form.Control
							size="sm"
							name="confirm-password"
							type="password"
							autoComplete="new-password"
							placeholder="Confirm Password"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
						/>
						<Button type="submit">Create Account</Button>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default SignUpPage;
