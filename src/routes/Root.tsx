import { Outlet, Link } from "react-router-dom";

function Root() {
	return (
		// Renders directly into #root div.
		<>
			<p>NAVBAR</p>
			<Link to="/">Home</Link>
			<Link to="/login">Login</Link>
			<Outlet />
			<p>FOOTER</p>
		</>
	);
}
export default Root;
