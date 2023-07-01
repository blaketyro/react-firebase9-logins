import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./accounts";
import "./index.css";
import { ModalProvider } from "./modal";
import DeleteAccountPage from "./routes/DeleteAccountPage";
import ErrorPage from "./routes/ErrorPage";
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
