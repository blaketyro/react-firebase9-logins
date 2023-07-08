import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./auth";
import "./index.css";
import { ModalProvider } from "./modal";
import ChangeEmailPage from "./routes/ChangeEmailPage";
import ChangePasswordPage from "./routes/ChangePasswordPage";
import ChangeProfilePage from "./routes/ChangeProfilePage";
import DeleteAccountPage from "./routes/DeleteAccountPage";
import ErrorPage from "./routes/ErrorPage";
import ForgotPasswordPage from "./routes/ForgotPasswordPage";
import HomePage from "./routes/HomePage";
import Root from "./routes/Root";
import SignInPage from "./routes/SignInPage";
import SignOutPage from "./routes/SignOutPage";
import SignUpPage from "./routes/SignUpPage";
import VerifyEmailPage from "./routes/VerifyEmailPage";
import { ToastProvider } from "./toast";

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
				path: "sign-out",
				element: <SignOutPage />,
			},
			{
				path: "verify-email",
				element: <VerifyEmailPage />,
			},
			{
				path: "change-email",
				element: <ChangeEmailPage />,
			},
			{
				path: "change-profile",
				element: <ChangeProfilePage />,
			},
			{
				path: "change-password",
				element: <ChangePasswordPage />,
			},
			{
				path: "forgot-password",
				element: <ForgotPasswordPage />,
			},
			{
				path: "delete-account",
				element: <DeleteAccountPage />,
			},
		],
	},
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<StrictMode>
		<ToastProvider>
			<ModalProvider>
				<UserProvider>
					<RouterProvider router={router} />
				</UserProvider>
			</ModalProvider>
		</ToastProvider>
	</StrictMode>
);
