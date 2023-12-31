import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { Link, useNavigate } from "react-router-dom";
import { AuthErrorCodes, signIn, useUser } from "../auth";
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
							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Signing In", "danger");
							setPassword(""); // Always clear password.

							switch (await signIn(email, password)) {
								case undefined:
									setEmail("");
									makeToast("Successfully signed in", "Signed In", "success");
									navigate("/");
									break;
								case AuthErrorCodes.InvalidEmail:
									makeErrorToast("Invalid email address");
									break;
								case AuthErrorCodes.UserNotFound:
									makeErrorToast("User not found");
									break;
								case AuthErrorCodes.MissingPassword:
									makeErrorToast("No password provided");
									break;
								case AuthErrorCodes.WrongPassword:
									makeErrorToast("Incorrect password");
									break;
								case AuthErrorCodes.TooManyRequests:
									makeErrorToast("Too many requests - try again later");
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
							name="password"
							type="password"
							autoComplete="current-password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit">Sign In</Button>

						<Stack gap={2} direction="horizontal" className="justify-content-between">
							<Link to="/forgot-password">Forgot Password</Link>
							<Link to="/sign-up">Sign Up</Link>
						</Stack>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default SignInPage;
