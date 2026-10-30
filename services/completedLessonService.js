import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

const emptyUnsubscribe = () => {};

const requireStudentUid = () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No logged in student.");
  }

  return uid;
};

export const listenCompletedLessons = ({
  onSuccess = () => {},
  onError = () => {},
}) => {
  let uid;

  try {
    uid = requireStudentUid();
  } catch (error) {
    onError(error);
    return emptyUnsubscribe;
  }

  const completedLessonsQuery = query(
    collection(db, "completedLessons"),
    where("userId", "==", uid)
  );

  return onSnapshot(
    completedLessonsQuery,
    (snapshot) => {
      const completedMap = {};

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        if (!data.lessonId) return;

        completedMap[data.lessonId] = {
          id: docSnap.id,
          ...data,
        };
      });

      onSuccess(completedMap);
    },
    (error) => {
      console.log("Listen completed lessons error:", error);
      onError(error);
    }
  );
};