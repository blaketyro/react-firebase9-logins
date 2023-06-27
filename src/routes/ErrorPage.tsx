import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

function ErrorPage() {
	return (
		<Alert variant="light">
			<h3>An error occurred!</h3>
			<p>Most likely the page you're trying to visit doesn't exist.</p>
			<Link to="/">Back to homepage</Link>
		</Alert>
	);
}

export default ErrorPage;
