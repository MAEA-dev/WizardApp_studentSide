import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { updateLoginStreak } from "./dailyStreakService";

import {
  getStudentCache,
  saveStudentCache,
  clearStudentCache,
} from "./studentCacheService";

export const getLoggedInStudentUid = () => {
  return auth.currentUser?.uid || null;
};

export const requireStudentUid = () => {
  const uid = getLoggedInStudentUid();

  if (!uid) {
    throw new Error("No logged in student.");
  }

  return uid;
};

export const getStudentRef = (uid) => {
  return doc(db, "users", uid);
};

export const getStudentFromFirebase = async () => {
  const uid = requireStudentUid();
  const studentRef = getStudentRef(uid);

  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists()) {
    throw new Error("Student data not found.");
  }

  return {
    uid,
    ...snapshot.data(),
  };
};

export const cacheAndReturnStudent = async (student) => {
  if (!student?.uid) return null;

  await saveStudentCache(student.uid, student);

  return student;
};

export const loadStudentCacheFirst = async () => {
  const uid = requireStudentUid();

  const cachedStudent = await getStudentCache(uid);

  if (cachedStudent) {
    return cachedStudent;
  }

  const firebaseStudent = await getStudentFromFirebase();

  return cacheAndReturnStudent(firebaseStudent);
};

export const syncStudentFromFirebase = async () => {
  const firebaseStudent = await getStudentFromFirebase();

  return cacheAndReturnStudent(firebaseStudent);
};

export const prepareStudentAfterLogin = async () => {
  const student = await syncStudentFromFirebase();

  if (!student) return student;

  try {
    const streakData = await updateLoginStreak();
    return cacheAndReturnStudent({ ...student, ...streakData });
  } catch (error) {
    console.warn("Could not update daily login streak:", error);
    return student;
  }
};

export const clearStudentLocalData = async () => {
  const uid = getLoggedInStudentUid();

  if (!uid) return;

  await clearStudentCache(uid);
};
