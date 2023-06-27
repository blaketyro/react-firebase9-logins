// My API for the login systems (dependency inverted so the React stuff doesn't need to know about Firebase).

import {
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	signInWithEmailAndPassword,
} from "firebase/auth";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { auth } from "./firebase-config";

const DEBUG_LOGINS = true;
const debugMsg = (...messages: unknown[]) => {
	if (DEBUG_LOGINS) console.info(...messages);
};

// Re-export even the User type so nothing else needs to import Firebase.
export type User = FirebaseUser;

const UserContext = React.createContext<User | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	useEffect(
		() =>
			onAuthStateChanged(auth, (currentUser) => {
				debugMsg("User is now", currentUser?.email);
				setUser(currentUser);
			}),
		[]
	);
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

export const signIn = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed in", userCredential.user.email);
	} catch (error) {
		console.error("Error signing in:", error);
	}
};

export const signUp = async (email: string, password: string) => {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed up", userCredential.user.email);
	} catch (error) {
		console.error("Error signing up:", error);
	}
};

export const signOut = async () => {
	try {
		await firebaseSignOut(auth);
		debugMsg("Successfully signed out");
	} catch (error) {
		console.error("Error signing out:", error);
	}
};
