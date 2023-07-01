import { deleteUser, reauthenticateUser, signOut } from "./accounts";
import { useMakeToast } from "./toast";

type MakeToast = ReturnType<typeof useMakeToast>;

// Keep these async since sometimes it's useful to await for them to finish to do a further action.

export const signOutHelper = async (makeToast: MakeToast) => {
	switch (await signOut()) {
		case undefined:
			makeToast("Successfully signed out", "Signed Out");
			break;
		case "misc/unspecified-error":
			makeToast("Unspecified error signing out", "Sign Out Error", "danger");
	}
};

// export const reauthenticateUserHelper = async (makeToast: MakeToast) => {};

export const deleteUserHelper = async (makeToast: MakeToast, alwaysReauthenticate?: boolean) => {
	if (alwaysReauthenticate) {
		makeToast("Re-auth required (TODO)");
		await reauthenticateUser(window.prompt("pw") ?? "");
	}

	switch (await deleteUser()) {
		case undefined:
			makeToast("Successfully deleted account", "Account Deleted", "success");
			break;
		case "auth/requires-recent-login":
			makeToast("Re-auth required (TODO)");
			// TODO!!! implement re-auth modal or the like https://firebase.google.com/docs/reference/js/v8/firebase.User#reauthenticatewithcredential
			break;
		case "misc/no-user":
		case "misc/unspecified-error":
			makeToast("Unspecified error deleting account", "Account Deletion Error", "danger");
	}
};
