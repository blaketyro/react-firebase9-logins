import { signOut } from "./logins";
import { useMakeToast } from "./toasts";

export const signOutWithToast = async (makeToast: ReturnType<typeof useMakeToast>) => {
	switch (await signOut()) {
		case undefined:
			makeToast("Successfully signed out", "success");
			break;
		default:
			makeToast("Error signing out", "danger");
	}
};
