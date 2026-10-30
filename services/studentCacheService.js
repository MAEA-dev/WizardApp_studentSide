import AsyncStorage from "@react-native-async-storage/async-storage";

const STUDENT_CACHE_PREFIX = "student_cache_";

const getStudentCacheKey = (uid) => {
  return `${STUDENT_CACHE_PREFIX}${uid}`;
};

export const saveStudentCache = async (uid, studentData) => {
  try {
    if (!uid || !studentData) return null;

    const payload = {
      ...studentData,
      cachedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      getStudentCacheKey(uid),
      JSON.stringify(payload)
    );

    return payload;
  } catch (error) {
    console.log("Save student cache error:", error);
    return null;
  }
};

export const getStudentCache = async (uid) => {
  try {
    if (!uid) return null;

    const cached = await AsyncStorage.getItem(getStudentCacheKey(uid));

    if (!cached) return null;

    return JSON.parse(cached);
  } catch (error) {
    console.log("Get student cache error:", error);
    return null;
  }
};

export const updateStudentCache = async (uid, updates) => {
  try {
    if (!uid || !updates) return null;

    const currentCache = await getStudentCache(uid);

    const updatedCache = {
      ...(currentCache || {}),
      ...updates,
      cachedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      getStudentCacheKey(uid),
      JSON.stringify(updatedCache)
    );

    return updatedCache;
  } catch (error) {
    console.log("Update student cache error:", error);
    return null;
  }
};

export const clearStudentCache = async (uid) => {
  try {
    if (!uid) return;

    await AsyncStorage.removeItem(getStudentCacheKey(uid));
  } catch (error) {
    console.log("Clear student cache error:", error);
  }
};