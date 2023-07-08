// My API for the user auth systems (dependency inverted so the React stuff doesn't need to know about Firebase).

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
	updatePassword,
} from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { firebaseAuth, publicSiteUrl } from "./firebase-config";

const DEBUG_AUTH = true;
const debugMsg = (...messages: unknown[]) => {
	if (DEBUG_AUTH) console.info(...messages);
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
	MissingNewPassword: "misc/missing-new-password",
	NoEmail: "misc/no-email",
	NoUser: "misc/no-user",
	RequiresRecentLogin: "auth/requires-recent-login",
	TooManyRequests: "auth/too-many-requests", // TODO!!! make this different as it always may be possible
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

// The general try/catch form is the same for all the auth functions, so DRY it with this helper maker function.
const makeAuthFunction = <TCodes extends readonly SpecifiedAuthErrorCode[], TArgs extends unknown[]>(
	debugName: string,
	logic: (errorWith: (code: TCodes[number]) => never, ...args: TArgs) => Promise<void>,
	possibleErrors: TCodes
) => {
	return async (...args: TArgs): Promise<undefined | TCodes[number] | UnspecifiedAuthErrorCode> => {
		try {
			await logic((code) => {
				throw { code };
			}, ...args);
			debugMsg(`${debugName} Worked!`);
		} catch (error) {
			debugMsg(`${debugName} Errored:`, error);
			return extractErrorCode(error, possibleErrors);
		}
	};
};

//#region Core Account Functions:

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#createuserwithemailandpassword */
export const signUp = makeAuthFunction(
	"signUp",
	async (errorWith, email: string, password: string, passwordConfirmation: string) => {
		// Note that passwords of some or all whitespace are allowed.
		if (password !== passwordConfirmation) {
			throw errorWith(AuthErrorCode.UnconfirmedPassword);
		}
		await createUserWithEmailAndPassword(firebaseAuth, email, password);
	},
	[
		AuthErrorCode.EmailAlreadyInUse,
		AuthErrorCode.InvalidEmail,
		AuthErrorCode.MissingPassword,
		AuthErrorCode.UnconfirmedPassword,
		AuthErrorCode.WeakPassword,
	]
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithemailandpassword */
export const signIn = makeAuthFunction(
	"signIn",
	async (_, email: string, password: string) => {
		await signInWithEmailAndPassword(firebaseAuth, email, password);
	},
	[AuthErrorCode.InvalidEmail, AuthErrorCode.UserNotFound, AuthErrorCode.MissingPassword, AuthErrorCode.WrongPassword]
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signout */
export const SignOutError = [] as const;
export const signOut = makeAuthFunction(
	"signOut",
	async () => {
		await firebaseSignOut(firebaseAuth);
	},
	[] // Sign out shouldn't error, but keep the same form for consistency and safety.
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#sendemailverification */
export const sendVerificationEmail = makeAuthFunction(
	"sendVerificationEmail",
	async (errorWith, redirectUrl: string = publicSiteUrl) => {
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
	},
	[AuthErrorCode.TooManyRequests, AuthErrorCode.NoUser, AuthErrorCode.AlreadyVerified]
	// Verification email template can't be customized much:
	// https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
	// Could customize more following https://blog.logrocket.com/send-custom-email-templates-firebase-react-express
	// which uses SendGrid which allows 100 emails per day free: https://sendgrid.com/pricing/
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#delete */
export const deleteUser = makeAuthFunction(
	"deleteUser",
	async (errorWith) => {
		if (!firebaseAuth.currentUser) {
			throw errorWith(AuthErrorCode.NoUser);
		}
		await firebaseAuth.currentUser.delete();
	},
	[AuthErrorCode.NoUser, AuthErrorCode.RequiresRecentLogin]
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#reauthenticatewithcredential */
export const reauthenticateUser = makeAuthFunction(
	"reauthenticateUser",
	async (errorWith, password: string) => {
		if (!firebaseAuth.currentUser) {
			throw errorWith(AuthErrorCode.NoUser);
		}
		if (!firebaseAuth.currentUser.email) {
			throw errorWith(AuthErrorCode.NoEmail);
		}
		const authCredential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, password);
		await reauthenticateWithCredential(firebaseAuth.currentUser, authCredential);
	},
	[AuthErrorCode.MissingPassword, AuthErrorCode.WrongPassword, AuthErrorCode.NoUser, AuthErrorCode.NoEmail]
);

/** Firebase docs: https://firebase.google.com/docs/reference/js/v8/firebase.User#updatepassword */
export const changePassword = makeAuthFunction(
	"changePassword",
	async (errorWith, currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
		if (!firebaseAuth.currentUser) {
			throw errorWith(AuthErrorCode.NoUser);
		}
		if (!firebaseAuth.currentUser.email) {
			throw errorWith(AuthErrorCode.NoEmail);
		}

		// Always reauth with current password. This ensures auth/requires-recent-login can't happen.
		const authCredential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, currentPassword);
		await reauthenticateWithCredential(firebaseAuth.currentUser, authCredential);

		if (newPassword !== newPasswordConfirmation) {
			throw errorWith(AuthErrorCode.UnconfirmedPassword);
		}
		// updatePassword in Firebase allows empty string as passwords which then can't be used to log in.
		// (This may not be a bug but rather a way of resetting the password for passwordless auth?)
		// So catch that case here. Fine since we needed to anyway to have a separate error scenario.
		if (newPassword === "") {
			throw errorWith(AuthErrorCode.MissingNewPassword);
		}

		await updatePassword(firebaseAuth.currentUser, newPassword);
	},
	[
		AuthErrorCode.MissingPassword,
		AuthErrorCode.MissingNewPassword,
		AuthErrorCode.NoEmail,
		AuthErrorCode.NoUser,
		AuthErrorCode.UnconfirmedPassword,
		AuthErrorCode.WeakPassword,
		AuthErrorCode.WrongPassword,
	]
);

//#endregion
