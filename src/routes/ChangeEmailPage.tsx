import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { AuthErrorCodes, changeEmail } from "../auth";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const ChangeEmailPage = () => {
	const makeToast = useMakeToast();

	const [newEmail, setNewEmail] = useState("");

	return (
		<Box>
			<h3>Change Email</h3>
			<p>
				Enter your new email address and click the button below and a link will be sent to your new email to
				confirm the change.
			</p>
			<SignInGuard mode="require-signed-in">
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) =>
								makeToast(message, "Error Changing Email", "danger");
							const makeSuccessToast = () => {
								setNewEmail("");
								makeToast(
									"Follow the link sent to your new email to confirm the change",
									"Email Change Verification Sent",
									"success",
									5000
								);
							};

							switch (await changeEmail(newEmail)) {
								case undefined:
									makeSuccessToast();
									break;
								case AuthErrorCodes.RequiresRecentLogin:
									// TODO!!!
									break;
								case AuthErrorCodes.MissingNewEmail:
									makeErrorToast("New email not provided");
									break;
								case AuthErrorCodes.InvalidNewEmail:
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
