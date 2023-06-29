import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import AlreadyLoggedInGuard from "../components/AlreadyLoggedInGuard";
import Box from "../components/Box";
import { signUp } from "../logins";

// TODO!!! email already exists error
// TODO!!! password too short error
// TODO!!! redirect home on successful login and show alert
// TODO!!!? x on textboxes?
// TODO!!!? reveal eye button on password box?

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Box>
			<AlreadyLoggedInGuard>
				<Form
					onSubmit={(event) => {
						void signUp(email, password);
						setEmail("");
						setPassword("");
						event.preventDefault();
					}}
				>
					<Stack gap={2}>
						<h3
							onClick={() => {
								setEmail("example@example.com");
								setPassword("example");
							}}
						>
							Register
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
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit">Create Account</Button>
					</Stack>
				</Form>
			</AlreadyLoggedInGuard>
		</Box>
	);
};

export default RegisterPage;
