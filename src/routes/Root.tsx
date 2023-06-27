import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Stack from "react-bootstrap/Stack";
import { Link, Outlet } from "react-router-dom";
import { signOut, useUser } from "../logins";

function Root() {
	const user = useUser();
	return (
		// Renders directly into #root div.
		<>
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
						<Button variant="secondary" size="sm" onClick={signOut}>
							Sign Out
						</Button>
					</Stack>
				) : (
					<Navbar.Text className="text-secondary">Not signed in</Navbar.Text>
				)}
			</Navbar>
			<Container className="p-4 d-flex flex-row justify-content-center align-items-center" as="main">
				<Outlet />
			</Container>
		</>
	);
}
export default Root;
