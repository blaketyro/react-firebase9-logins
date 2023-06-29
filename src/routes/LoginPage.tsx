import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import AlreadyLoggedInGuard from "../components/AlreadyLoggedInGuard";
import Box from "../components/Box";
import { signIn } from "../logins";
import { useMakeToast } from "../toasts";

const LoginPage = () => {
	const makeToast = useMakeToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Box>
			<AlreadyLoggedInGuard>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) => makeToast(message, "Login Error", "danger");
							setPassword(""); // Always clear password.

							switch (await signIn(email, password)) {
								case undefined:
									makeToast("Successfully signed in", "Logged In", "success");
									setEmail("");
									navigate("/");
									break;
								case "auth/invalid-email":
									makeErrorToast("Invalid email address");
									break;
								case "auth/user-not-found":
									makeErrorToast("User not found");
									break;
								case "auth/missing-password":
									makeErrorToast("No password provided");
									break;
								case "auth/wrong-password":
									makeErrorToast("Incorrect password");
									break;
								case "unspecified-error":
									makeErrorToast("Unspecified error signing in");
									setEmail("");
							}
						})();
					}}
				>
					<Stack gap={2}>
						<h3
							onClick={() => {
								setEmail("example@example.com");
								setPassword("example");
							}}
						>
							Login
						</h3>
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
			</AlreadyLoggedInGuard>
		</Box>
	);
};

export default LoginPage;
