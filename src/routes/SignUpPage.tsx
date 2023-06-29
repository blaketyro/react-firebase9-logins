import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { signUp } from "../accounts";
import AlreadySignedInGuard from "../components/AlreadySignedInGuard";
import Box from "../components/Box";
import { useMakeToast } from "../toasts";

// TODO? x on textboxes?
// TODO? reveal eye button on password box?

const SignUpPage = () => {
	const makeToast = useMakeToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	return (
		<Box>
			<AlreadySignedInGuard>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) => makeToast(message, "Sign Up Error", "danger");
							// Debatable when exactly which textboxes should be cleared.
							switch (await signUp(email, password, passwordConfirmation)) {
								case undefined:
									makeToast("Successfully signed up!", "Signed Up", "success");
									setEmail("");
									setPassword("");
									setPasswordConfirmation("");
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
									makeErrorToast("Unspecified error signing in");
									setEmail("");
									setPassword("");
									setPasswordConfirmation("");
							}
						})();
					}}
				>
					<Stack gap={2}>
						<h3
							onClick={() => {
								setEmail("example@example.com");
								setPassword("example");
								setPasswordConfirmation("example");
							}}
						>
							Sign Up
						</h3>
						<Form.Control
							name="email"
							// type="email"
							// autoComplete="email"
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
			</AlreadySignedInGuard>
		</Box>
	);
};

export default SignUpPage;
