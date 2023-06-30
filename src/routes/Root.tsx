import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Stack from "react-bootstrap/Stack";
import { Link, Outlet } from "react-router-dom";
import { signOutWithToasts, useUser } from "../accounts";
import ToastTestButton from "../components/ToastTestButton";
import { useMakeToast } from "../toasts";

const Header = () => {
	const user = useUser();
	const makeToast = useMakeToast();

	return (
		<Navbar className="justify-content-between px-3 flex-wrap border-bottom">
			<Nav className="flex-wrap">
				<Navbar.Brand href="/">React Firebase 9 Logins</Navbar.Brand>
				<Stack direction="horizontal" className="flex-wrap">
					<Link to="/" className="nav-link">
						Home
					</Link>
					<Link to="/sign-up" className="nav-link">
						Sign Up
					</Link>
					<Link to="/sign-in" className="nav-link">
						Sign In
					</Link>
					<Link to="/verify-email" className="nav-link">
						Verify Email
					</Link>
				</Stack>
			</Nav>
			{user ? (
				<Stack gap={2} direction="horizontal">
					<Navbar.Text className="text-info">Signed in as {user.email}</Navbar.Text>
					<Button variant="secondary" size="sm" onClick={() => signOutWithToasts(makeToast)}>
						Sign Out
					</Button>
				</Stack>
			) : (
				<Navbar.Text className="text-secondary">Not signed in</Navbar.Text>
			)}
		</Navbar>
	);
};

const Footer = () => {
	return (
		<Stack gap={2} as="nav" direction="horizontal" className="p-2 flex-wrap justify-content-between">
			<a href="https://github.com/blaketyro/react-firebase9-logins">GitHub Repo</a>
			<Stack gap={2} as="nav" direction="horizontal" className="flex-wrap">
				<ToastTestButton variant="success" timeoutMs={1000} />
				<ToastTestButton variant="primary" timeoutMs={5000} />
				<ToastTestButton variant="danger" timeoutMs={10000} />
				<ToastTestButton variant="secondary" timeoutMs={30000} />
			</Stack>
		</Stack>
	);
};

const Root = () => (
	// Renders directly into #root div.
	<>
		<div>
			<Header />
			<Container className="p-3 p-md-5 d-flex justify-content-center" as="main">
				<Outlet />
			</Container>
		</div>
		<Footer />
	</>
);

export default Root;
