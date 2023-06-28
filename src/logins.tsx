// My API for the login systems (dependency inverted so the React stuff doesn't need to know about Firebase).

import {
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase-config";

const DEBUG_LOGINS = true;
const debugMsg = (...messages: unknown[]) => {
	if (DEBUG_LOGINS) console.info(...messages);
};

//#region User Type and Context

export type User = FirebaseUser; // Re-export even the User type so nothing else needs to import Firebase.

const UserContext = createContext<User | null>(null);

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

//#endregion

//#region Sign Up, Sign In, Sign Out

export const UnspecifiedError = "unspecified-error";
export type UnspecifiedError = typeof UnspecifiedError;
type WithUnspecifiedError<T extends readonly string[] = []> = UnspecifiedError | T[number];

const extractFirebaseErrorCode = <T extends string>(
	error: unknown,
	specifiedErrors: readonly T[]
): UnspecifiedError | T => {
	if (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		typeof error.code === "string" &&
		specifiedErrors.includes(error.code as T)
	) {
		return error.code as T;
	}
	return UnspecifiedError;
};

export const SignUpError = ["auth/email-already-in-use", "auth/invalid-email", "auth/weak-password"] as const;
export type SignUpError = WithUnspecifiedError<typeof SignUpError>;
export const signUp = async (email: string, password: string): Promise<void | SignUpError> => {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed up", userCredential.user.email);
	} catch (error) {
		debugMsg("Error signing up:", error);
		return extractFirebaseErrorCode(error, SignUpError);
	}
};

export const SignInError = ["auth/invalid-email", "auth/user-not-found", "auth/wrong-password"] as const;
export type SignInError = WithUnspecifiedError<typeof SignInError>;
export const signIn = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed in", userCredential.user.email);
	} catch (error) {
		debugMsg("Error signing in:", error);
		return extractFirebaseErrorCode(error, SignInError);
	}
};

export const SignOutError = [] as const; // No common errors happen on sign out, but keep the same pattern.
export type SignOutError = WithUnspecifiedError<typeof SignOutError>;
export const signOut = async (): Promise<void | SignOutError> => {
	try {
		await firebaseSignOut(auth);
		debugMsg("Successfully signed out");
	} catch (error) {
		debugMsg("Error signing out:", error);
		return extractFirebaseErrorCode(error, SignOutError);
	}
};

//#endregion
