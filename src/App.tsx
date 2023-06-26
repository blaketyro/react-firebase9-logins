import { useEffect, useState } from "react";
import "./App.css";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import { User } from "firebase/auth";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";

// TODO!!!? try remaking this in nextjs+ts with bootstrap ui on gitlab
// TODO!!! password reset email functional
// TODO!!! password reset email nicely formatted
// TODO!!! ability to change password once logged in
// TODO!!! ability to change email once logged in?
// TODO!!! ability to delete account
// TODO!!! ability to require re-auth, e.g. for deletion
// TODO!!! 3rd party logins stuff too
// TODO!!! ability to require email confirmation

function App() {
	const [registerEmail, setRegisterEmail] = useState("");
	const [registerPassword, setRegisterPassword] = useState("");
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");

	const [user, setUser] = useState<User | null>(null);
	useEffect(() => onAuthStateChanged(auth, (currentUser) => setUser(currentUser)), []);

	const register = async () => {
		setRegisterEmail("");
		setRegisterPassword("");
		try {
			// Registers user and logs them in:
			await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
		} catch (error) {
			console.error("Error registering user:", error);
			// Errors when email is already registered or email is invalid, among other reasons
			// Also when password is less than 6 chars
		}
	};

	const login = async () => {
		setLoginEmail("");
		setLoginPassword("");
		try {
			await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
		} catch (error) {
			console.error("Error logging in user:", error);
		}
	};

	const logout = async () => {
		await signOut(auth);
	};

	return (
		<Stack gap={4}>
			<Form
				onSubmit={(event) => {
					register();
					// Having things in onSubmit rather than onClick is good to allow Enter to work.
					// But need to prevent the default form action.
					event.preventDefault();
				}}
			>
				<Stack gap={2}>
					<h3>Register</h3>
					<Form.Control
						type="email"
						value={registerEmail}
						placeholder="Email"
						onChange={(e) => setRegisterEmail(e.target.value)}
					/>
					<Form.Control
						type="password"
						value={registerPassword}
						placeholder="Password"
						onChange={(e) => setRegisterPassword(e.target.value)}
					/>
					<Button type="submit">Create Account</Button>
				</Stack>
			</Form>

			<Form
				onSubmit={(event) => {
					login();
					event.preventDefault();
				}}
			>
				<Stack gap={2}>
					<h3>Login</h3>
					<Form.Control
						type="email"
						value={loginEmail}
						placeholder="Email"
						onChange={(e) => setLoginEmail(e.target.value)}
					/>
					<Form.Control
						type="password"
						value={loginPassword}
						placeholder="Password"
						onChange={(e) => setLoginPassword(e.target.value)}
					/>
					<Button type="submit">Sign In</Button>
				</Stack>
			</Form>

			<Stack gap={2}>
				<h3>Current User</h3>
				<p>{user?.email ?? "None"}</p>
				<Button variant="secondary" onClick={logout}>
					Sign Out
				</Button>
			</Stack>
		</Stack>
	);
}

export default App;
