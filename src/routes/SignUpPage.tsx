import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { exampleEmail, examplePassword } from "../accountHelpers";
import { signUp, useUser } from "../accounts";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

// TODO? x on textboxes?
// TODO? reveal eye button on password box?

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
			<SignInGuard>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) => makeToast(message, "Sign Up Error", "danger");
							// Debatable when exactly which textboxes should be cleared.
							switch (await signUp(email, password, passwordConfirmation)) {
								case undefined:
									setEmail("");
									setPassword("");
									setPasswordConfirmation("");
									makeToast("Successfully signed up!", "Signed Up", "success");
									navigate("/");
									break;
								case "auth/email-already-in-use":
									makeErrorToast("That email already has an account");
									break;
								case "auth/invalid-email":
									makeErrorToast("Invalid email address");
									break;
								case "auth/missing-password":
									makeErrorToast("No password provided");
									break;
								case "auth/weak-password":
									makeErrorToast("Password must be at least 6 characters long");
									break;
								case "misc/unconfirmed-password":
									makeErrorToast("Passwords don't match");
									setPasswordConfirmation("");
									break;
								case "misc/unspecified-error":
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
