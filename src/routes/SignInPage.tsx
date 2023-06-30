import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { signIn } from "../accounts";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toasts";

const SignInPage = () => {
	const makeToast = useMakeToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Box>
			<SignInGuard>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) => makeToast(message, "Sign In Error", "danger");
							setPassword(""); // Always clear password.
							switch (await signIn(email, password)) {
								case undefined:
									setEmail("");
									makeToast("Successfully signed in!", "Signed In", "success");
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
								case "misc/unspecified-error":
									setEmail("");
									makeErrorToast("Unspecified error signing in");
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
							Sign In
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
			</SignInGuard>
		</Box>
	);
};

export default SignInPage;
