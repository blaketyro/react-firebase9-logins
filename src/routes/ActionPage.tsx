// The OOB (out of band) action page handles OOB codes that come from things like email verifications and password
// resets. It is not normally linked or accessible from anywhere on the rest of the site. Firebase has its own
// default UI to do these things (/__/auth/action?mode=...&oobCode=...) but it can be customized by changing the
// Action URLs in the auth email templates. That's what this page is for - to provide custom UI for OOB actions
// using custom Action URL of "https://react-firebase9-logins.firebaseapp.com/action".
// Templates: https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
// Search params format: .../action?mode=...&oobCode=...&apiKey=...&continueUrl=...&lang=en

import { ReactNode, useEffect, useState } from "react";
import Stack from "react-bootstrap/Stack";
import { Link, useSearchParams } from "react-router-dom";
import { AuthErrorCodes, confirmVerificationEmail, getOrigin } from "../auth";
import Box from "../components/Box";
import HomeLink from "../components/HomeLink";

const actionComponents: Record<string, ({ searchParams }: { searchParams: URLSearchParams }) => ReactNode> = {
	verifyEmail: ({ searchParams }) => {
		const [node, setNode] = useState<ReactNode>(<>Confirming email verification...</>);

		const oobCode = searchParams.get("oobCode") ?? "";
		const continueUrl = searchParams.get("continueUrl") ?? getOrigin();

		useEffect(() => {
			void (async () => {
				switch (await confirmVerificationEmail(oobCode)) {
					case null:
						setNode(
							<>
								Your email address has been verified!
								<Link to={continueUrl}>Continue to the site.</Link>
							</>
						);
						break;
					case AuthErrorCodes.InvalidActionCode:
						setNode(<>Invalid action code.</>);
						break;
					case AuthErrorCodes.ExpiredActionCode:
						setNode(<>Link is expired. Please try again.</>);
						break;
					case AuthErrorCodes.UserNotFound:
						setNode(<>User not found. Possibly user has been deleted.</>);
						break;
					default:
						setNode(<>Unspecified error confirming email verification.</>);
				}
			})();
		}, []);

		return node;
	},
	resetPassword: () => <p>TODO</p>,
	unknown: () => <>Unknown action.</>,
};

const ActionPage = () => {
	const [searchParams] = useSearchParams();
	const mode = searchParams.get("mode");
	const ActionComponent = mode && mode in actionComponents ? actionComponents[mode] : actionComponents.unknown;

	return (
		<Box>
			<Stack gap={4}>
				<ActionComponent searchParams={searchParams} />
				<HomeLink />
			</Stack>
		</Box>
	);
};

export default ActionPage;
