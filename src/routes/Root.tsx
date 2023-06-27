import { Outlet, Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Navbar";

function Root() {
	return (
		// Renders directly into #root div.
		<>
			<Navbar className="justify-content-between p-2 flex-wrap">
				<Nav className="flex-wrap">
					<Navbar.Brand href="/">React Firebase 9 Logins</Navbar.Brand>
					<Navbar.Text className="text-warning">Current User: none</Navbar.Text>
				</Nav>
				<Nav className="flex-wrap">
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
			</Navbar>
			{/* TODO!!! How does the container have nav classes?? */}
			<Container className="p-4" as="main">
				<Outlet />
			</Container>
		</>
	);
}
export default Root;
