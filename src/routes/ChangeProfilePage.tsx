import { useState } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { useUser } from "../auth";
import Box from "../components/Box";
import SignInGuard from "../components/SignInGuard";

const CurrentProfile = () => {
	const user = useUser();
	const displayName = user?.displayName ?? null;
	const photoURL = user?.photoURL ?? null; // "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"

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
	// https://firebase.google.com/docs/reference/js/v8/firebase.User#updateprofile

	const [displayName, setDisplayName] = useState("");
	const [photoURL, setPhotoURL] = useState("");

	return (
		<Box wide>
			<h3>Change Profile</h3>
			<SignInGuard mode="require-signed-in">
				<CurrentProfile />
				<Form>
					<Stack gap={3}>
						<Stack>
							<p className="m-0 mb-1">Change Display Name</p>
							<Stack gap={2} direction="horizontal">
								<Form.Control
									name="display-name"
									type="text"
									placeholder="New Display Name"
									autoComplete="username"
									value={displayName}
									onChange={(e) => setDisplayName(e.target.value)}
								/>
								<Button>Update</Button>
								<Button variant="danger">Remove</Button>
							</Stack>
						</Stack>
						<Stack>
							<p className="m-0 mb-1">Change Profile Photo URL</p>
							<Stack gap={2} direction="horizontal">
								<Form.Control
									name="photo"
									type="url"
									placeholder="New Profile Photo URL"
									autoComplete="photo"
									value={photoURL}
									onChange={(e) => setPhotoURL(e.target.value)}
								/>
								<Button>Update</Button>
								<Button variant="danger">Remove</Button>
							</Stack>
						</Stack>

						<p>
							<Link to="/change-email">Change Email Here</Link>
						</p>
					</Stack>
				</Form>
			</SignInGuard>
		</Box>
	);
};

export default ChangeProfilePage;
