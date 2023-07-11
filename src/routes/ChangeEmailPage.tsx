import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { AuthErrorCodes, changeEmail } from "../auth";
import { reauthenticateUserHelper } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeModal } from "../modal";
import { useMakeToast } from "../toast";

const ChangeEmailPage = () => {
	const makeToast = useMakeToast();
	const makeModal = useMakeModal();
	const [newEmail, setNewEmail] = useState("");

	return (
		<Box>
			<h3>Change Email</h3>
			<SignInGuard mode="require-signed-in">
				<p>
					Enter your new email address to use. An email will be sent to your original email address with a
					link to revoke the change if needed.
				</p>
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Changing Email", "danger");
							const makeSuccessToast = () =>
								makeToast("Successfully changed email", "Changed email", "success");

							switch (await changeEmail(newEmail)) {
								case undefined:
									setNewEmail("");
									makeSuccessToast();
									break;
								case AuthErrorCodes.RequiresRecentLogin:
									if (await reauthenticateUserHelper(makeModal)) {
										// Try again after successful reauth.
										switch (await changeEmail(newEmail)) {
											case undefined:
												setNewEmail("");
												makeSuccessToast();
												break;
											default:
												makeErrorToast("Reauthentication unexpectedly failed"); // Should never happen.
										}
									}
									break;
								case AuthErrorCodes.MissingEmail:
									makeErrorToast("New email not provided");
									break;
								case AuthErrorCodes.InvalidEmail:
									makeErrorToast("Invalid new email address");
									break;
								case AuthErrorCodes.EmailAlreadyInUse:
									makeErrorToast("That email already has an account");
									break;
								case AuthErrorCodes.TooManyRequests:
									makeErrorToast("Too many requests - try again later");
									break;
								default:
									setNewEmail("");
									makeErrorToast("Unspecified error changing email");
							}
						})();
					}}
				>
					<Stack gap={2}>
						<Form.Control
							name="new-email"
							type="email"
							autoComplete="email"
							placeholder="New Email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
						/>
						<Button type="submit">Update Email</Button>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default ChangeEmailPage;
