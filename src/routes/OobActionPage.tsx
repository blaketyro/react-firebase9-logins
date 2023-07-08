// The OOB (out of band) action page handles OOB codes that come from things like email verifications and password
// resets. It is not normally linked or accessible from anywhere on the rest of the site. Firebase has its own
// default UI to do these things (/__/auth/action?mode=...&oobCode=...) but it can be customized by changing the
// Action URLs in the auth email templates. That's what this page is for - to provide custom UI for OOB actions
// using custom Action URL of "https://react-firebase9-logins.firebaseapp.com/action".
// Templates: https://console.firebase.google.com/u/0/project/react-firebase9-logins/authentication/emails
// Search params format: .../action?mode=...&oobCode=...&apiKey=...&continueUrl=...&lang=en

import { useSearchParams } from "react-router-dom";

const OobActionPage = () => {
	const [searchParams] = useSearchParams();

	// TODO!!! show success/error after calling the appropriate method on page load. Show continue link.

	return (
		<p>
			Mode: {searchParams.get("mode")}
			<br />
			<br />
			oobCode: {searchParams.get("oobCode")}
			<br />
			<br />
			continueUrl: {searchParams.get("continueUrl")}
		</p>
	);
};

export default OobActionPage;
