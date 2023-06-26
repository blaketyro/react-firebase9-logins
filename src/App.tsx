import { useEffect, useState } from "react";
import "./App.css";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import { User } from "firebase/auth";

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

	useEffect(
		() =>
			onAuthStateChanged(auth, (currentUser) => {
				setUser(currentUser);
				console.log(currentUser);
			}),
		[]
	);

	const register = async () => {
		setRegisterEmail("");
		setRegisterPassword("");
		try {
			// Registers user and logs them in:
			const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
			console.log("User successfully created:", user);
		} catch (error) {
			console.log("Error registering user:", error);
			// Errors when email is already registered or email is invalid, among other reasons
			// Also when password is less than 6 chars
		}
	};

	const login = async () => {
		setLoginEmail("");
		setLoginPassword("");
		try {
			const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
			console.log("User successfully logged in:", user);
		} catch (error) {
			console.log("Error logging in user:", error);
		}
	};

	const logout = async () => {
		await signOut(auth);
	};

	return (
		<div className="app">
			<div className="flex-col">
				<h3>Register User</h3>
				<input
					type="text"
					placeholder="email..."
					value={registerEmail}
					onChange={(e) => setRegisterEmail(e.target.value)}
				/>
				<input
					type="text"
					placeholder="password..."
					value={registerPassword}
					onChange={(e) => setRegisterPassword(e.target.value)}
				/>
				<button type="button" onClick={register}>
					Create User
				</button>
			</div>

			<div className="flex-col">
				<h3>Login</h3>
				<input
					type="text"
					placeholder="email..."
					value={loginEmail}
					onChange={(e) => setLoginEmail(e.target.value)}
				/>
				<input
					type="text"
					placeholder="password..."
					value={loginPassword}
					onChange={(e) => setLoginPassword(e.target.value)}
				/>
				<button type="button" onClick={login}>
					Login
				</button>
			</div>

			<div className="flex-col">
				<h3>User Logged In:</h3>
				<p>{user?.email ?? "None"}</p>
				<button type="button" onClick={logout}>
					Sign Out
				</button>
			</div>
		</div>
	);
}

export default App;
