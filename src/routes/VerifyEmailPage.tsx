import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { AuthErrorCodes, getOrigin, sendVerificationEmail, useUser } from "../auth";
import { exampleEmail } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

// TODO? Automatically notice when email has been verified and update the page?

const VerifyEmailPage = () => {
	const user = useUser();
	const makeToast = useMakeToast();

	return (
		<Box>
			<h3>Verify Email</h3>
			<SignInGuard mode="require-signed-in">
				{user?.emailVerified ? (
					<>
						<p>
							Your email address, <span className="text-info">{user?.email}</span>, is verified. Great!
						</p>
						<p>
							<Link to="/">Back to homepage</Link>
						</p>
					</>
				) : (
					<>
						<p>
							Verify your email address by clicking the button below and then following the link in the
							email that is sent to <span className="text-info">{user?.email}</span>.
						</p>
						<Button
							onClick={() => {
								void (async () => {
									if (user?.email === exampleEmail) {
										makeToast("Not sending email to example email address", "Didn't Send Email");
										return;
									}

									const makeErrorToast = (message: string) =>
										makeToast(message, "Error Sending Email", "danger");
									switch (await sendVerificationEmail(getOrigin("/verify-email"))) {
										case null:
											makeToast("Sent verification email", "Sent Email", "success");
											break;
										case AuthErrorCodes.TooManyRequests:
											makeErrorToast("Too many requests - try again later");
											break;
										default:
											makeErrorToast("Unspecified error sending verification email");
									}
								})();
							}}
						>
							Send Verification Email
						</Button>
					</>
				)}
			</SignInGuard>
		</Box>
	);
};

export default VerifyEmailPage;
