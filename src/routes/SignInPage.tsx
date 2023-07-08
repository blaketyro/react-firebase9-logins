import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { AuthErrorCode, signIn, useUser } from "../auth";
import { exampleEmail, examplePassword } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const SignInPage = () => {
	const user = useUser();
	const makeToast = useMakeToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Box>
			<h3
				onClick={() => {
					if (!user) {
						setEmail(exampleEmail);
						setPassword(examplePassword);
					}
				}}
			>
				Sign In
			</h3>
			<SignInGuard mode="require-signed-out">
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) => makeToast(message, "Sign In Error", "danger");
							setPassword(""); // Always clear password.
							switch (await signIn(email, password)) {
								case undefined:
									setEmail("");
									makeToast("Successfully signed in", "Signed In", "success");
									navigate("/");
									break;
								case AuthErrorCode.InvalidEmail:
									makeErrorToast("Invalid email address");
									break;
								case AuthErrorCode.UserNotFound:
									makeErrorToast("User not found");
									break;
								case AuthErrorCode.MissingPassword:
									makeErrorToast("No password provided");
									break;
								case AuthErrorCode.WrongPassword:
									makeErrorToast("Incorrect password");
									break;
								default:
									setEmail("");
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
							name="Password"
							type="password"
							autoComplete="current-password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit">Sign In</Button>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default SignInPage;
