// My API for the user account systems (dependency inverted so the React stuff doesn't need to know about Firebase).

// firebase/auth docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth
// User docs: https://firebase.google.com/docs/reference/js/v8/firebase.User
// Edit email templates: https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails

// TODO? Email enumeration prevention? https://firebase.google.com/docs/auth/web/password-auth#enumeration-protection

import {
	EmailAuthProvider,
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	reauthenticateWithCredential,
	sendEmailVerification,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, publicSiteUrl } from "./firebase-config";

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
				debugMsg("User is now", currentUser?.email ?? null);
				setUser(currentUser);
			}),
		[]
	);
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
export const useUser = () => useContext(UserContext);

//#endregion

//#region Helper Types and Functions:
// The core account functions below convert the errors Firebase throws into strings that are returned instead with
// the help of these types and functions. This allows TS to know exactly what can happen, giving better type safety.

export const ErrorCode = {
	UnspecifiedError: "misc/unspecified-error",
	// Specified errors, A-Z:
	AlreadyVerified: "misc/already-verified",
	EmailAlreadyInUse: "auth/email-already-in-use",
	InvalidEmail: "auth/invalid-email",
	MissingPassword: "auth/missing-password",
	NoEmail: "misc/no-email",
	NoUser: "misc/no-user",
	RequiresRecentLogin: "auth/requires-recent-login",
	TooManyRequests: "auth/too-many-requests",
	UnconfirmedPassword: "misc/unconfirmed-password",
	UserNotFound: "auth/user-not-found",
	WeakPassword: "auth/weak-password",
	WrongPassword: "auth/wrong-password",
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
type UnspecifiedErrorCode = typeof ErrorCode.UnspecifiedError;
type SpecifiedErrorCode = Exclude<ErrorCode, UnspecifiedErrorCode>;

const extractErrorCode = <TCodes extends readonly SpecifiedErrorCode[]>(
	error: unknown,
	specifiedErrors: TCodes
): TCodes[number] | UnspecifiedErrorCode => {
	if (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		typeof error.code === "string" &&
		specifiedErrors.includes(error.code as TCodes[number])
	) {
		return error.code as TCodes[number];
	}
	return ErrorCode.UnspecifiedError;
};

// The general try/catch logic is the same for all the account functions, so DRY it with this helper function.
const handleErrorLogic = async <TCodes extends readonly SpecifiedErrorCode[]>(
	debugName: string,
	possibleErrors: TCodes,
	logic: (throwCode: (code: SpecifiedErrorCode) => never) => Promise<void>
) => {
	try {
		await logic((code) => {
			throw { code };
		});
		debugMsg(`${debugName} Worked!`);
	} catch (error) {
		debugMsg(`${debugName} Errored:`, error);
		return extractErrorCode(error, possibleErrors);
	}
};
// TODO!!! use in other functions

//#region Core Account Functions:

// Sign up docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#createuserwithemailandpassword
export const SignUpError = [
	ErrorCode.EmailAlreadyInUse,
	ErrorCode.InvalidEmail,
	ErrorCode.MissingPassword,
	ErrorCode.WeakPassword,
	ErrorCode.UnconfirmedPassword,
] as const;
export const signUp = async (email: string, password: string, passwordConfirmation: string) =>
	await handleErrorLogic("signUp", SignUpError, async (throwCode) => {
		if (password !== passwordConfirmation) {
			throwCode(ErrorCode.UnconfirmedPassword); // Note that passwords of some or all whitespace are allowed.
		}
		await createUserWithEmailAndPassword(auth, email, password);
	});

// Sign in docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithemailandpassword
export const SignInError = [
	"auth/invalid-email",
	"auth/user-not-found",
	"auth/missing-password",
	"auth/wrong-password",
] as const;
export const signIn = async (email: string, password: string) => {
	try {
		await signInWithEmailAndPassword(auth, email, password);
		debugMsg("Successfully signed in as", auth.currentUser?.email);
	} catch (error) {
		debugMsg("Error signing in:", error);
		return extractErrorCode(error, SignInError);
	}
};

// Sign out docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signout
export const SignOutError = [] as const;
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

// Verify docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#sendemailverification
export const SendVerificationEmailError = ["auth/too-many-requests", "misc/no-user", "misc/already-verified"] as const;
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

// Delete docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#delete
export const DeleteUserError = ["misc/no-user", "auth/requires-recent-login"] as const;
export const deleteUser = async () => {
	try {
		const toDelete = auth.currentUser?.email;
		if (!auth.currentUser) {
			throw { code: "misc/no-user" };
		}
		await auth.currentUser.delete(); // Using deleteUser imported from "firebase/auth" also works.
		debugMsg("Successfully deleted", toDelete);
	} catch (error) {
		debugMsg("Error deleting user:", error);
		return extractErrorCode(error, DeleteUserError);
	}
};

// Reauth docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#reauthenticatewithcredential
export const ReauthenticateUserError = [
	"auth/missing-password",
	"auth/wrong-password",
	"misc/no-user",
	"misc/no-email",
] as const;
export const reauthenticateUser = async (password: string) => {
	try {
		if (!auth.currentUser) {
			throw { code: "misc/no-user" };
		}
		if (!auth.currentUser.email) {
			throw { code: "misc/no-email" };
		}
		const authCredential = EmailAuthProvider.credential(auth.currentUser.email, password);
		await reauthenticateWithCredential(auth.currentUser, authCredential);
		debugMsg("Successfully reauthenticated", auth.currentUser.email);
	} catch (error) {
		debugMsg("Error reauthenticating:", error);
		return extractErrorCode(error, ReauthenticateUserError);
	}
};

export const ChangePasswordError = [] as const;
export const changePassword = async (currentPassword: string, newPassword: string, passwordConfirmation: string) => {
	// try {
	// 	if (!auth.currentUser) {
	// 	}
	// } catch (error) {
	// 	debugMsg("Error changing password:", error)
	// 	return extractErrorCode(error, ChangePasswordError)
	// }
};

//#endregion
