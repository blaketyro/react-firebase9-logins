import { signIn, signOut } from "./logins";
import { useMakeToast } from "./toasts";

type MakeToast = ReturnType<typeof useMakeToast>;

// TODO!!! put sign in and register codes in their respective files after all
// TODO!!! rethink converting all errors to strings, kind of a hassle, bleh, maybe just throw string?

export const signInWithToasts = async (makeToast: MakeToast, email: string, password: string) => {
	const result = await signIn(email, password);
	(() => {
		switch (result) {
			case undefined:
				return () => makeToast("Successfully signed in", "success");
			case "auth/invalid-email":
				return () => makeToast("Invalid email address", "danger");
			case "auth/user-not-found":
				return () => makeToast("User not found", "danger");
			case "auth/wrong-password":
				return () => makeToast("Incorrect password", "danger");
			case "unspecified-error":
				return () => makeToast("Unspecified error signing in", "danger");
		}
	})()(); // Trick to make sure switch is exhaustive.
};

export const signOutWithToasts = async (makeToast: MakeToast) => {
	const result = await signOut();
	(() => {
		switch (result) {
			case undefined:
				return () => makeToast("Successfully signed out", "success");
			case "unspecified-error":
				return () => makeToast("Unspecified error signing out", "danger");
		}
	})()(); // Trick to make sure switch is exhaustive.
};
