// My API for the user account systems (dependency inverted so the React stuff doesn't need to know about Firebase).

// firebase/auth docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth
// Edit email templates: https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails

// TODO? Email enumeration prevention? https://firebase.google.com/docs/auth/web/password-auth#enumeration-protection

import {
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	sendEmailVerification,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, publicSiteUrl } from "./firebase-config";
import { useMakeToast } from "./toasts";

const DEBUG = true;
const debugMsg = (...messages: unknown[]) => {
	if (DEBUG) console.info(...messages);
};

//#region User Type and Context:

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

// The sign up/in/out/etc. functions below convert the errors Firebase throws into strings that are returned instead.
// This allows Typescript to know what exact "errors" (returns) can happen, giving better type safety.

export const UnspecifiedError = "misc/unspecified-error";
export type UnspecifiedError = typeof UnspecifiedError;
type WithUnspecifiedError<T extends readonly string[] = []> = UnspecifiedError | T[number];

const extractErrorCode = <T extends string>(error: unknown, specifiedErrors: readonly T[]): UnspecifiedError | T => {
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

// Sign up docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#createuserwithemailandpassword
export const SignUpError = [
	"auth/email-already-in-use",
	"auth/invalid-email",
	"auth/missing-password",
	"auth/weak-password",
	"misc/unconfirmed-password",
] as const;
export type SignUpError = WithUnspecifiedError<typeof SignUpError>;
export const signUp = async (email: string, password: string, passwordConfirmation: string) => {
	try {
		if (password !== passwordConfirmation) {
			throw { code: "misc/unconfirmed-password" }; // Note that passwords of some or all whitespace are allowed.
		}
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed up", userCredential.user.email);
	} catch (error) {
		debugMsg("Error signing up:", error);
		return extractErrorCode(error, SignUpError);
	}
};

// Sign in docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithemailandpassword
export const SignInError = [
	"auth/invalid-email",
	"auth/user-not-found",
	"auth/missing-password",
	"auth/wrong-password",
] as const;
export type SignInError = WithUnspecifiedError<typeof SignInError>;
export const signIn = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed in", userCredential.user.email);
	} catch (error) {
		debugMsg("Error signing in:", error);
		return extractErrorCode(error, SignInError);
	}
};

// Sign out docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signout
export const SignOutError = [] as const;
export type SignOutError = WithUnspecifiedError<typeof SignInError>;
export const signOut = async () => {
	// Sign out shouldn't normally throw errors, but follow the same array/try/catch pattern as sign up/in to be safe.
	// There may be unexpected errors since the docs are not exhaustive and this is more consistent and future-proof.
	try {
		await firebaseSignOut(auth);
		debugMsg("Successfully signed out");
	} catch (error) {
		debugMsg("Error signing out:", error);
		return extractErrorCode(error, SignOutError);
	}
};
export const signOutWithToasts = (makeToast: ReturnType<typeof useMakeToast>) => {
	// This function doesn't strictly belong in this file but not sure where else to put it.
	void (async () => {
		switch (await signOut()) {
			case undefined:
				makeToast("Successfully signed out", "Signed Out");
				break;
			case "misc/unspecified-error":
				makeToast("Unspecified error signing out", "Sign Out Error", "danger");
		}
	})();
};

// Verify docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#sendemailverification
export const SendVerificationEmailError = ["auth/too-many-requests", "misc/no-user", "misc/already-verified"] as const;
export type SendVerificationEmailError = WithUnspecifiedError<typeof SignInError>;
export const sendVerificationEmail = async (redirectUrl = publicSiteUrl) => {
	try {
		if (!auth.currentUser) {
			throw { code: "misc/no-user" };
		}
		if (auth.currentUser.emailVerified) {
			// Curiously, Firebase will happily send more emails to someone already verified.
			throw { code: "misc/already-verified" };
		}
		await sendEmailVerification(auth.currentUser, { url: redirectUrl });
		debugMsg("Sending verification email to", auth.currentUser?.email);
	} catch (error) {
		debugMsg("Error sending verification email:", error);
		return extractErrorCode(error, SendVerificationEmailError);
	}
	// Verification email template can't be customized much:
	// https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
	// Could customize more following https://blog.logrocket.com/send-custom-email-templates-firebase-react-express
	// which uses SendGrid which allows 100 emails per day free: https://sendgrid.com/pricing/
};
