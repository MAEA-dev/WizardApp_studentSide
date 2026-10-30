import { auth, db, functions } from "./firebaseConfig";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

const createUserFn = httpsCallable(functions, "createUser");

export const createUser = async (data) => {
  try {
    const response = await createUserFn(data);
    return response.data;
  } catch (error) {
    console.log("Create user error:", error);
    throw error;
  }
};

export const loginUsername = async ({
  username,
  password,
}) => {
  try {
    const cleanUsername = String(username || "")
      .trim()
      .toLowerCase();

    if (!cleanUsername) {
      const error = new Error("Username is required.");
      error.code = "username/empty";
      throw error;
    }

    if (!password) {
      const error = new Error("Password is required.");
      error.code = "password/empty";
      throw error;
    }

    const usernameRef = doc(db, "usernames", cleanUsername);
    const usernameSnap = await getDoc(usernameRef);

    if (!usernameSnap.exists()) {
      const error = new Error("Username not found.");
      error.code = "username/not-found";
      throw error;
    }

    const usernameData = usernameSnap.data();
    const email = usernameData?.email;

    if (!email) {
      const error = new Error("Account email not found.");
      error.code = "username/email-missing";
      throw error;
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential.user;
  } catch (error) {
    console.log("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.log("Logout error:", error);
    return false;
  }
};

export const watchCurrentUserUid = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? user.uid : null);
  });
};

export const getCurrentUserUid = () => {
  return auth.currentUser?.uid || null;
};

export const getCurrentUser = () => {
  return auth.currentUser || null;
};

export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case "username/empty":
      return "Please enter your username.";

    case "password/empty":
      return "Please enter your password.";

    case "username/not-found":
      return "No account with this username.";

    case "username/email-missing":
      return "This username is missing login information.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect username or password.";

    case "auth/network-request-failed":
      return "Check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many login attempts. Try again later.";

    case "auth/user-not-found":
      return "User account not found.";

    case "functions/already-exists":
      return "Username or email already exists.";

    case "functions/permission-denied":
      return "Permission denied.";

    case "functions/unavailable":
      return "Server unavailable.";

    default:
      return (
        error.message ||
        "Something went wrong. Please try again."
      );
  }
};