// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
	// This stuff is safe to share as long as security rules are in place.
	// cspell:disable-next-line
	apiKey: "AIzaSyB_28RbkPRD7Pcl0Knl6jAQQIKR-JwQASc",
	authDomain: "react-firebase9-logins.firebaseapp.com",
	projectId: "react-firebase9-logins",
	storageBucket: "react-firebase9-logins.appspot.com",
	messagingSenderId: "107532213324",
	appId: "1:107532213324:web:8e31d763f744eb687ba8e9",
} as const;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export const publicSiteUrl = "https://react-firebase9-logins.firebaseapp.com/";
// ...web.app also works but the ...firebaseapp.com seems more common in templates and stuff so use it for consistency.
