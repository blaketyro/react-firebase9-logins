import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { changePassword } from "../accounts";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const ChangePasswordPage = () => {
	const makeToast = useMakeToast();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

	return (
		<Box>
			<h3>Change Password</h3>
			<SignInGuard mode="require-signed-in">
				<Form
					onSubmit={(event) => {
						event.preventDefault();
						void (async () => {
							const makeErrorToast = (message: string) =>
								makeToast(message, "Change Password Error", "danger");

							switch (await changePassword(currentPassword, newPassword, newPasswordConfirmation)) {
								case undefined:
									break;
								default:
									makeErrorToast("error");
								// TODO!!!
							}
						})();
					}}
				>
					<Stack gap={2}>
						<Form.Control
							name="Password"
							type="password"
							autoComplete="current-password"
							placeholder="Current Password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
						<Form.Control
							name="new-password"
							type="password"
							autoComplete="new-password"
							placeholder="New Password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<Form.Control
							name="confirm-new-password"
							type="password"
							autoComplete="new-password"
							placeholder="Confirm New Password"
							value={newPasswordConfirmation}
							onChange={(e) => setNewPasswordConfirmation(e.target.value)}
						/>
						<Button type="submit">Update Password</Button>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default ChangePasswordPage;
