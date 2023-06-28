import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import Box from "../components/Box";
import { signIn } from "../logins";

// TODO!!! wrong password prompt
// TODO!!! unknown email prompt
// TODO!!! redirect home on successful login
// TODO!!! handle if already logged in

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Box>
			<Form
				onSubmit={(event) => {
					void signIn(email, password);
					setEmail("");
					setPassword("");
					event.preventDefault();
				}}
			>
				<Stack gap={2}>
					<h3>Login</h3>
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
		</Box>
	);
}

export default LoginPage;
