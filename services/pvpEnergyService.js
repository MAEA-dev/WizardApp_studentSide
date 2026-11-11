import { httpsCallable } from "firebase/functions";

import { auth, functions } from "./firebaseConfig";
import { updateStudentCache } from "./studentCacheService";

const getStudentEnergyCall = httpsCallable(functions, "getStudentEnergy");
const startPvpMatchCall = httpsCallable(functions, "startPvpMatch");
const requestPvpRematchCall = httpsCallable(functions, "requestPvpRematch");

const requireAuthenticatedUser = async () => {
  const user = auth.currentUser;
  if (!user?.uid) throw new Error("Sign in to use PvP.");
  await user.getIdToken();
  return user;
};

const cacheEnergy = async (uid, energy) => {
  await updateStudentCache(uid, { energy });
};

export const refreshPvpEnergy = async () => {
  const user = await requireAuthenticatedUser();
  const response = await getStudentEnergyCall();
  await cacheEnergy(user.uid, response.data.energy);
  return response.data;
};

export const startPvpMatch = async ({ roomKey, sessionId, matchId }) => {
  const user = await requireAuthenticatedUser();
  const response = await startPvpMatchCall({ roomKey, sessionId, matchId });
  if (response.data.started) await cacheEnergy(user.uid, response.data.energy);
  return response.data;
};

export const requestPvpRematch = async ({ roomKey, sessionId }) => {
  await requireAuthenticatedUser();
  const response = await requestPvpRematchCall({ roomKey, sessionId });
  return response.data;
};
