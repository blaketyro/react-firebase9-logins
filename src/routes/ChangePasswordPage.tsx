import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { AuthErrorCode, changePassword, signOut } from "../auth";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const ChangePasswordPage = () => {
	const makeToast = useMakeToast();
	const navigate = useNavigate();

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
									setCurrentPassword("");
									setNewPassword("");
									setNewPasswordConfirmation("");
									makeToast(
										"Successfully changed password - please sign in again",
										"Changed Password",
										"success",
										5000
									);
									await signOut();
									navigate("/sign-in");
									break;
								case AuthErrorCode.MissingPassword:
									makeErrorToast("Current password not provided");
									break;
								case AuthErrorCode.MissingNewPassword:
									makeErrorToast("New password not provided");
									break;
								case AuthErrorCode.UnconfirmedPassword:
									makeErrorToast("New passwords don't match");
									break;
								case AuthErrorCode.WeakPassword:
									makeErrorToast("New password must be at least 6 characters");
									break;
								case AuthErrorCode.WrongPassword:
									makeErrorToast("Incorrect current password");
									break;
								default:
									setCurrentPassword("");
									setNewPassword("");
									setNewPasswordConfirmation("");
									makeErrorToast("Unspecified error changing password");
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
