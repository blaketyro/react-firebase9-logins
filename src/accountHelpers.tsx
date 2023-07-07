import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { deleteUser, reauthenticateUser, signOut } from "./accounts";
import { MakeModal, ModalComponent, awaitModal } from "./modal";
import { MakeToast, useMakeToast } from "./toast";

export const exampleEmail = "example@example.com"; // https://stackoverflow.com/q/1368163
export const examplePassword = "example";

// Keep these async since sometimes it's useful to await for them to finish to do a further action.

export const signOutHelper = async (makeToast: MakeToast) => {
	switch (await signOut()) {
		case undefined:
			makeToast("Successfully signed out", "Signed Out", "success");
			break;
		case "misc/unspecified-error":
			makeToast("Unspecified error signing out", "Sign Out Error", "danger");
	}
};

const ReauthenticationModal: ModalComponent = ({ close }) => {
	const makeToast = useMakeToast();
	const [password, setPassword] = useState("");

	return (
		<>
			<Form
				onSubmit={(event) => {
					event.preventDefault();
					void (async () => {
						const makeErrorToast = (message: string) =>
							makeToast(message, "Reauthentication Error", "danger");
						setPassword(""); // Always clear password.
						switch (await reauthenticateUser(password)) {
							case undefined:
								close("success");
								break;
							case "auth/missing-password":
								makeErrorToast("No password provided");
								break;
							case "auth/wrong-password":
								makeErrorToast("Incorrect password");
								break;
							case "misc/no-user":
							case "misc/no-email":
							case "misc/unspecified-error":
								makeErrorToast("Unspecified error reauthenticating");
						}
					})();
				}}
			>
				<Stack gap={2}>
					<Form.Text>Please confirm your password</Form.Text>
					<Form.Control
						name="Password"
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Button type="submit">Confirm</Button>
					<Button variant="secondary" onClick={() => close("cancel")}>
						Cancel
					</Button>
				</Stack>
			</Form>
		</>
	);
};

// Async function that returns bool of whether reauthentication was successful or not.
export const reauthenticateUserHelper = async (makeModal: MakeModal) => {
	const result = await awaitModal(makeModal, "Reauthentication Required", ReauthenticationModal);
	return result === "success";
};

export const deleteUserHelper = async (makeToast: MakeToast, makeModal: MakeModal, alwaysReauthenticate?: boolean) => {
	const makeErrorToast = (message: string) => makeToast(message, "Account Deletion Error", "danger");
	const makeReauthNotProvidedToast = () => makeErrorToast("Reauthentication not provided");

	if (alwaysReauthenticate) {
		if (!(await reauthenticateUserHelper(makeModal))) {
			makeReauthNotProvidedToast();
			return false;
		}
	}

	const makeSuccessToast = () => makeToast("Successfully deleted account", "Account Deleted", "success");
	switch (await deleteUser()) {
		case undefined:
			makeSuccessToast();
			return true;
		case "auth/requires-recent-login":
			if (await reauthenticateUserHelper(makeModal)) {
				// Try deleting again after successful reauth.
				switch (await deleteUser()) {
					case undefined:
						makeSuccessToast();
						return true;
					default:
						makeErrorToast("Reauthentication unexpectedly failed"); // Should never happen.
				}
			} else {
				makeReauthNotProvidedToast();
			}
			break;
		case "misc/no-user":
		case "misc/unspecified-error":
			makeErrorToast("Unspecified error deleting account");
	}
	return false;
};
