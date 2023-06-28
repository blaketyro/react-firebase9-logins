import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Stack from "react-bootstrap/Stack";
import { Link, Outlet } from "react-router-dom";
import { signOut, useUser } from "../logins";
import { BootstrapVariant, useMakeToast } from "../toasts";

// TODO!!! Sign Out alert

const Header = () => {
	const user = useUser();
	return (
		<Navbar className="justify-content-between px-3 flex-wrap border-bottom">
			<Nav className="flex-wrap">
				<Navbar.Brand href="/">React Firebase 9 Logins</Navbar.Brand>
				<Link to="/" className="nav-link">
					Home
				</Link>
				<Link to="/login" className="nav-link">
					Login
				</Link>
				<Link to="/register" className="nav-link">
					Register
				</Link>
				<Nav.Link href="https://github.com/blaketyro/react-firebase9-logins">GitHub</Nav.Link>
			</Nav>
			{user ? (
				<Stack gap={2} direction="horizontal">
					<Navbar.Text className="text-info">Signed in as {user.email}</Navbar.Text>
					<Button variant="secondary" size="sm" onClick={() => void signOut()}>
						Sign Out
					</Button>
				</Stack>
			) : (
				<Navbar.Text className="text-secondary">Not signed in</Navbar.Text>
			)}
		</Navbar>
	);
};

const ToastTester = ({ variant, timeoutMs }: { variant: BootstrapVariant; timeoutMs: number }) => {
	const makeToast = useMakeToast();
	return (
		<Button
			size="sm"
			variant={variant}
			onClick={() =>
				makeToast(`Toast Test 🔥🍞 ${Math.floor(Math.random() * 10000)}`, {
					title: "Testing",
					variant,
					timeoutMs,
				})
			}
		>
			Toast Test {timeoutMs}ms
		</Button>
	);
};

const Footer = () => {
	return (
		<Stack gap={2} as="nav" direction="horizontal" className="p-2 flex-wrap">
			<ToastTester variant="success" timeoutMs={1000} />
			<ToastTester variant="primary" timeoutMs={5000} />
			<ToastTester variant="danger" timeoutMs={10000} />
			<ToastTester variant="secondary" timeoutMs={30000} />
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
