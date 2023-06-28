import { Container } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const ErrorPage = () => {
	return (
		<Container className="p-4">
			<Alert variant="danger">
				<h3>An error occurred!</h3>
				<p>Most likely the page you're trying to visit doesn't exist.</p>
				<Link to="/">Back to homepage</Link>
			</Alert>
		</Container>
	);
};

export default ErrorPage;
