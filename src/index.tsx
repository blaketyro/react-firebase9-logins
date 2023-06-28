import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { UserProvider } from "./logins";
import ErrorPage from "./routes/ErrorPage";
import HomePage from "./routes/HomePage";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import Root from "./routes/Root";
import { ToastProvider } from "./toasts";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "",
				element: <HomePage />,
			},
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "register",
				element: <RegisterPage />,
			},
		],
	},
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<StrictMode>
		<ToastProvider>
			<UserProvider>
				<RouterProvider router={router} />
			</UserProvider>
		</ToastProvider>
	</StrictMode>
);
