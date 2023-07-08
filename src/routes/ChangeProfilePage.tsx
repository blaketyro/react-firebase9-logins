import { useState } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { useUser } from "../auth";
import { changeDisplayNameHelper, changeProfilePhotoHelper, exampleDisplayName, examplePhotoUrl } from "../authHelpers";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";
import { useMakeToast } from "../toast";

const CurrentProfile = () => {
	const user = useUser();
	// Treat empty string and null name/photos the same for simplicity. (Firebase seems to do this anyway?)
	const displayName = user?.displayName || null;
	const photoURL = user?.photoURL || null; // "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"

	return (
		<Stack className="border rounded p-3 mb-3 bg-dark">
			<h5>Current Profile</h5>
			<Stack gap={2} direction="horizontal" className="flex-wrap">
				<Stack gap={2} className="justify-content-center">
					{displayName ? (
						<div className="fw-bold">{displayName}</div>
					) : (
						<div className="text-muted">no display name</div>
					)}
					<div className="text-info">{user?.email}</div>
				</Stack>

				{photoURL ? (
					<a href={photoURL} style={{ width: 128, height: 128 }}>
						<img src={photoURL} width={128} height={128} alt="User profile" />
					</a>
				) : (
					<div className="text-muted">no profile photo</div>
				)}
			</Stack>
		</Stack>
	);
};

const ChangeProfilePage = () => {
	const makeToast = useMakeToast();
	const [displayName, setDisplayName] = useState("");
	const [photoUrl, setPhotoUrl] = useState("");

	return (
		<Box wide>
			<h3>Change Profile</h3>
			<SignInGuard mode="require-signed-in">
				<CurrentProfile />
				<Stack gap={3}>
					<Stack>
						<p className="m-0 mb-1" onClick={() => setDisplayName(exampleDisplayName)}>
							Change Display Name
						</p>
						<Stack gap={2} direction="horizontal">
							<Form.Control
								name="display-name"
								type="text"
								placeholder="New Display Name"
								autoComplete="username"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
							/>
							<Button
								disabled={!displayName}
								onClick={() => {
									void (async () => {
										await changeDisplayNameHelper(makeToast, displayName);
										setDisplayName("");
									})();
								}}
							>
								Update
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									void (async () => {
										await changeDisplayNameHelper(makeToast, "");
										setDisplayName("");
									})();
								}}
							>
								Remove
							</Button>
						</Stack>
					</Stack>
					<Stack>
						<p className="m-0 mb-1" onClick={() => setPhotoUrl(examplePhotoUrl)}>
							Change Profile Photo URL
						</p>
						<Stack gap={2} direction="horizontal">
							<Form.Control
								name="photo"
								type="url"
								placeholder="New Profile Photo URL"
								autoComplete="photo"
								value={photoUrl}
								onChange={(e) => setPhotoUrl(e.target.value)}
							/>
							<Button
								disabled={!photoUrl}
								onClick={() => {
									void (async () => {
										await changeProfilePhotoHelper(makeToast, photoUrl);
										setPhotoUrl("");
									})();
								}}
							>
								Update
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									void (async () => {
										await changeProfilePhotoHelper(makeToast, "");
										setPhotoUrl("");
									})();
								}}
							>
								Remove
							</Button>
						</Stack>
					</Stack>

					<p>
						<Link to="/change-email">Change Email Here</Link>
					</p>
				</Stack>
			</SignInGuard>
		</Box>
	);
};

export default ChangeProfilePage;
