import { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { useUser } from "../auth";
import { deleteUserHelper, reauthenticateUserHelper } from "../authHelpers";
import Box from "../components/Box";
import { useMakeModal } from "../modal";
import { useMakeToast } from "../toast";

const UserTidbit = ({ title, value, horizontal }: { title: string; value: ReactNode; horizontal?: boolean }) => {
	return (
		<Col lg className="py-2">
			<Stack direction={horizontal ? "horizontal" : undefined} gap={horizontal ? 4 : 0}>
				<div className="text-uppercase fw-bold text-muted">{title}</div>
				{value ? <div className="text-info">{value}</div> : <div className="text-muted">none</div>}
			</Stack>
		</Col>
	);
};

const HomePage = () => {
	const user = useUser();
	const makeToast = useMakeToast();
	const makeModal = useMakeModal();
	const photoURL = user?.photoURL; // ?? "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg";

	return (
		<Box wide>
			<h3>Homepage</h3>
			<p>
				This website,{" "}
				<a href="https://react-firebase9-logins.firebaseapp.com">react-firebase9-logins.firebaseapp.com</a>, is
				a reference implementation of a Firebase app that implements user auth and logins using the{" "}
				<a href="https://firebase.google.com/docs/web/modular-upgrade">Firebase 9+ modular API</a>, as well as
				the{" "}
				<a href="https://firebase.google.com/docs/auth?hl=en&authuser=1&_gl=1*1oolcop*_ga*Mjk1NzA5MjQ0LjE2ODMwODA2MTY.*_ga_CW55HF8NVT*MTY4NzgwNDE4OC4yMi4xLjE2ODc4MDQzMzguMC4wLjA.#identity-platform">
					Firebase Auth with Identity Platform
				</a>
				. It is built with <a href="https://www.typescriptlang.org/">Typescript</a>,{" "}
				<a href="https://react.dev/">React</a>, <a href="https://reactrouter.com/en/main">React Router</a>, and{" "}
				<a href="https://react-bootstrap.netlify.app/">React Bootstrap</a>, and, of course, Google's{" "}
				<a href="https://firebase.google.com/">Firebase</a>, especially the{" "}
				<a href="https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth">auth</a> features.
			</p>
			<p>
				I made it for practice to understand Firebase and user auth systems better. The code is available{" "}
				<a href="https://github.com/blaketyro/react-firebase9-logins">on GitHub</a> under an MIT license. Feel
				free to use the code or the site yourself.
			</p>
			<p>
				Each feature of the user account system is on it's own page for simplicity. Create an account on the{" "}
				<Link to="/sign-up">sign up page</Link>, sign into an existing account on the{" "}
				<Link to="/sign-in">sign in page</Link>, or follow the navbar links for more actions.
			</p>

			<Stack className="border rounded p-3">
				<h5>Current User Info</h5>
				{user ? (
					<>
						<Row>
							<UserTidbit title="Email" value={user.email} />
							<UserTidbit title="Email Verified" value={user.emailVerified ? "Yes" : "No"} />
						</Row>
						<Row>
							<UserTidbit title="User ID" value={user.uid} />
							<UserTidbit title="IS ANONYMOUS" value={user.isAnonymous ? "Yes" : "No"} />
						</Row>
						<Row>
							<UserTidbit title="Creation Time" value={user.metadata.creationTime?.toString()} />
							<UserTidbit title="Last Sign In Time" value={user.metadata.lastSignInTime?.toString()} />
						</Row>
						<Row>
							<UserTidbit title="Display Name" value={user.displayName} />
							<UserTidbit title="Phone Number" value={user.phoneNumber} />
						</Row>
						<Row>
							<UserTidbit
								title="Profile Photo"
								horizontal={!!photoURL}
								value={
									photoURL ? (
										<a href={photoURL} style={{ width: 128, height: 128 }}>
											<img src={photoURL} width={128} height={128} alt="User profile" />
										</a>
									) : (
										<div className="text-muted">none</div>
									)
								}
							/>
							<Col className="gap-2 d-flex align-items-start">
								<Button
									size="sm"
									variant="secondary"
									className="mt-3"
									onClick={() => void deleteUserHelper(makeToast, makeModal)}
								>
									Delete Account
								</Button>
								<Button
									size="sm"
									variant="secondary"
									className="mt-3"
									onClick={() => {
										void (async () => {
											if (await reauthenticateUserHelper(makeModal)) {
												makeToast("Successfully reauthenticated", "Reauthenticated", "success");
											} else {
												makeToast("Reauthentication cancelled", "Didn't Reauthenticate");
											}
										})();
									}}
								>
									Reauth Account
								</Button>
							</Col>
						</Row>
					</>
				) : (
					<span className="text-muted">No user signed in</span>
				)}
			</Stack>
		</Box>
	);
};

export default HomePage;
