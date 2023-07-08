// My API for the user auth systems (dependency inverted so the React stuff doesn't need to know about Firebase).

// TODO!!! have an auth function maker, ofc

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
import { firebaseAuth, publicSiteUrl } from "./firebase-config";

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
			onAuthStateChanged(firebaseAuth, (currentUser) => {
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

export const AuthErrorCode = {
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

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
type UnspecifiedAuthErrorCode = typeof AuthErrorCode.UnspecifiedError;
type SpecifiedAuthErrorCode = Exclude<AuthErrorCode, UnspecifiedAuthErrorCode>;

const extractErrorCode = <TCodes extends readonly SpecifiedAuthErrorCode[]>(
	error: unknown,
	specifiedErrors: TCodes
): TCodes[number] | UnspecifiedAuthErrorCode => {
	if (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		typeof error.code === "string" &&
		specifiedErrors.includes(error.code as TCodes[number])
	) {
		return error.code as TCodes[number];
	}
	return AuthErrorCode.UnspecifiedError;
};

// The general try/catch logic is the same for all the account functions, so DRY it with this helper function.
const handleErrorLogic = async <TCodes extends readonly SpecifiedAuthErrorCode[]>(
	debugName: string,
	possibleErrors: TCodes,
	logic: (errorWith: (code: TCodes[number]) => never) => Promise<void>
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

//#region Core Account Functions:

// Sign up docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#createuserwithemailandpassword
export const SignUpError = [
	AuthErrorCode.EmailAlreadyInUse,
	AuthErrorCode.InvalidEmail,
	AuthErrorCode.MissingPassword,
	AuthErrorCode.WeakPassword,
	AuthErrorCode.UnconfirmedPassword,
] as const;
export const signUp = async (email: string, password: string, passwordConfirmation: string) =>
	await handleErrorLogic("signUp", SignUpError, async (errorWith) => {
		// Note that passwords of some or all whitespace are allowed.
		if (password !== passwordConfirmation) {
			throw errorWith(AuthErrorCode.UnconfirmedPassword);
		}
		await createUserWithEmailAndPassword(firebaseAuth, email, password);
	});

// Sign in docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithemailandpassword
export const SignInError = [
	AuthErrorCode.InvalidEmail,
	AuthErrorCode.UserNotFound,
	AuthErrorCode.MissingPassword,
	AuthErrorCode.WrongPassword,
] as const;
export const signIn = async (email: string, password: string) =>
	await handleErrorLogic("signIn", SignInError, async () => {
		await signInWithEmailAndPassword(firebaseAuth, email, password);
	});

// Sign out docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signout
export const SignOutError = [] as const; // Sign out shouldn't error, but keep the same form for consistency and safety.
export const signOut = async () =>
	await handleErrorLogic("signOut", SignOutError, async () => {
		await firebaseSignOut(firebaseAuth);
	});

// Verify docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#sendemailverification
// Verification email template can't be customized much:
// https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
// Could customize more following https://blog.logrocket.com/send-custom-email-templates-firebase-react-express
// which uses SendGrid which allows 100 emails per day free: https://sendgrid.com/pricing/
export const SendVerificationEmailError = [
	AuthErrorCode.TooManyRequests,
	AuthErrorCode.NoUser,
	AuthErrorCode.AlreadyVerified,
] as const;
export const sendVerificationEmail = async (redirectUrl = publicSiteUrl) =>
	await handleErrorLogic("sendVerificationEmail", SendVerificationEmailError, async (errorWith) => {
		if (!firebaseAuth.currentUser) {
			// The `throw` before `errorWith(...);` here and elsewhere is only needed to keep TS control flow analysis
			// happy since it can't tell that `errorWith` always throws an error, even though it returns never.
			// `return errorWith(...);` would also work identically, but using `throw` seems clearer.
			// See more: https://github.com/microsoft/TypeScript/issues/12825
			throw errorWith(AuthErrorCode.NoUser);
		}
		if (firebaseAuth.currentUser.emailVerified) {
			// Curiously, Firebase will happily send more emails to someone already verified.
			throw errorWith(AuthErrorCode.AlreadyVerified);
		}
		await sendEmailVerification(firebaseAuth.currentUser, { url: redirectUrl });
	});

// Delete docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#delete
export const DeleteUserError = [AuthErrorCode.NoUser, AuthErrorCode.RequiresRecentLogin] as const;
export const deleteUser = async () =>
	await handleErrorLogic("deleteUser", DeleteUserError, async (errorWith) => {
		if (!firebaseAuth.currentUser) {
			throw errorWith(AuthErrorCode.NoUser);
		}
		await firebaseAuth.currentUser.delete();
	});

// Reauth docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#reauthenticatewithcredential
export const ReauthenticateUserError = [
	AuthErrorCode.MissingPassword,
	AuthErrorCode.WrongPassword,
	AuthErrorCode.NoUser,
	AuthErrorCode.NoEmail,
] as const;
export const reauthenticateUser = async (password: string) =>
	await handleErrorLogic("reauthenticateUser", ReauthenticateUserError, async (withError) => {
		if (!firebaseAuth.currentUser) {
			throw withError(AuthErrorCode.NoUser);
		}
		if (!firebaseAuth.currentUser.email) {
			throw withError(AuthErrorCode.NoEmail);
		}
		const authCredential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, password);
		await reauthenticateWithCredential(firebaseAuth.currentUser, authCredential);
	});

export const ChangePasswordError = [] as const;
export const changePassword = async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
	console.log(currentPassword, newPassword, newPasswordConfirmation);
	await new Promise(() => null);
	// try {
	// 	if (!auth.currentUser) {
	// 	}
	// } catch (error) {
	// 	debugMsg("Error changing password:", error)
	// 	return extractErrorCode(error, ChangePasswordError)
	// }
};

//#endregion
