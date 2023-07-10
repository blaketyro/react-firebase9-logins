import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { AuthErrorCodes, changeDisplayName, changeProfilePhoto, deleteUser, reauthenticateUser, signOut } from "./auth";
import { MakeModal, ModalComponent, awaitModal } from "./modal";
import { MakeToast, useMakeToast } from "./toast";

export const exampleEmail = "example@example.com"; // https://stackoverflow.com/q/1368163
export const examplePassword = "example";
export const exampleDisplayName = "Example Name";
export const examplePhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg";

// Keep these async since sometimes it's useful to await for them to finish to do a further action.

export const signOutHelper = async (makeToast: MakeToast) => {
	const makeErrorToast = (message: string) => makeToast(message, "Error Signing Out", "danger");

	switch (await signOut()) {
		case undefined:
			makeToast("Successfully signed out", "Signed Out", "success");
			break;
		case AuthErrorCodes.TooManyRequests:
			makeErrorToast("Too many requests - try again later");
			break;
		default:
			makeErrorToast("Unspecified error signing out");
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
							makeToast(message, "Error Reauthenticating", "danger");
						setPassword(""); // Always clear password.
						switch (await reauthenticateUser(password)) {
							case undefined:
								close("success");
								break;
							case AuthErrorCodes.MissingPassword:
								makeErrorToast("No password provided");
								break;
							case AuthErrorCodes.WrongPassword:
								makeErrorToast("Incorrect password");
								break;
							case AuthErrorCodes.TooManyRequests:
								makeErrorToast("Too many requests - try again later");
								break;
							default:
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
	const makeErrorToast = (message: string) => makeToast(message, "Error Deleting Account", "danger");
	const makeReauthNotProvidedToast = () =>
		makeToast("Reauthentication not provided", "Account Not Deleted", "danger");

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
		case AuthErrorCodes.RequiresRecentLogin:
			if (await reauthenticateUserHelper(makeModal)) {
				// Try deleting again after successful reauth.
				if ((await deleteUser()) === undefined) {
					makeSuccessToast();
					return true;
				} else {
					makeErrorToast("Reauthentication unexpectedly failed"); // Should never happen.
				}
			} else {
				makeReauthNotProvidedToast();
			}
			break;
		case AuthErrorCodes.TooManyRequests:
			makeErrorToast("Too many requests - try again later");
			break;
		default:
			makeErrorToast("Unspecified error deleting account");
	}
	return false;
};

export const changeDisplayNameHelper = async (makeToast: MakeToast, newDisplayName: string) => {
	const makeErrorToast = (message: string) => makeToast(message, "Error Changing Display Name", "danger");
	switch (await changeDisplayName(newDisplayName)) {
		case undefined:
			makeToast(
				newDisplayName ? "Successfully changed display name" : "Successfully removed display name",
				"Display Name Changed",
				"success"
			);
			break;
		case AuthErrorCodes.TooManyRequests:
			makeErrorToast("Too many requests - try again later");
			break;
		default:
			makeErrorToast("Unspecified error changing display name");
	}
};

export const changeProfilePhotoHelper = async (makeToast: MakeToast, newPhotoUrl: string) => {
	const makeErrorToast = (message: string) => makeToast(message, "Error Changing Profile Photo", "danger");
	switch (await changeProfilePhoto(newPhotoUrl)) {
		case undefined:
			makeToast(
				newPhotoUrl ? "Successfully changed profile photo" : "Successfully removed profile photo",
				"Profile Photo Changed",
				"success"
			);
			break;
		case AuthErrorCodes.TooManyRequests:
			makeErrorToast("Too many requests - try again later");
			break;
		default:
			makeErrorToast("Unspecified error changing profile photo");
	}
};
