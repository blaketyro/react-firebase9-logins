import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./accounts";
import "./index.css";
import ErrorPage from "./routes/ErrorPage";
import HomePage from "./routes/HomePage";
import Root from "./routes/Root";
import SignInPage from "./routes/SignInPage";
import SignUpPage from "./routes/SignUpPage";
import VerifyEmailPage from "./routes/VerifyEmailPage";
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
				path: "sign-in",
				element: <SignInPage />,
			},
			{
				path: "sign-up",
				element: <SignUpPage />,
			},
			{
				path: "verify-email",
				element: <VerifyEmailPage />,
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
