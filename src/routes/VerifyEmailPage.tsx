import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { sendVerificationEmail, useUser } from "../accounts";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { publicSiteUrl } from "../firebase-config";
import { useMakeToast } from "../toasts";

// TODO? Automatically notice when email has been verified and update the page?

const VerifyEmailPage = () => {
	const user = useUser();
	const makeToast = useMakeToast();

	return (
		<Box>
			<SignInGuard requireSignIn>
				<Stack gap={2}>
					<h3>Verify Email</h3>
					{user?.emailVerified ? (
						<>
							<div>
								Your email address, <span className="text-info">{user?.email}</span>, is verified.
								Great!
							</div>
							<div>
								<Link to="/">Back to homepage</Link>
							</div>
						</>
					) : (
						<>
							<div>
								Verify your email address by clicking the button below and then following the link in
								the email that is sent to <span className="text-info">{user?.email}</span>.
							</div>
							<Button
								variant="secondary"
								onClick={() => {
									void (async () => {
										const makeErrorToast = (message: string) =>
											makeToast(message, "Email Error", "danger");
										switch (await sendVerificationEmail(publicSiteUrl + "verify-email")) {
											case undefined:
												makeToast("Sent verification email", "Sent Email");
												break;
											case "auth/too-many-requests":
												makeErrorToast("Too many requests! Try again in a bit");
												break;
											case "misc/no-user":
											case "misc/already-verified":
											case "misc/unspecified-error":
												makeErrorToast("Unspecified error sending verification email");
										}
									})();
								}}
							>
								Send Verification Email
							</Button>
						</>
					)}
				</Stack>
			</SignInGuard>
		</Box>
	);
};

export default VerifyEmailPage;
