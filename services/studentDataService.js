import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

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
  return syncStudentFromFirebase();
};

export const clearStudentLocalData = async () => {
  const uid = getLoggedInStudentUid();

  if (!uid) return;

  await clearStudentCache(uid);
};