import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useFirebaseLesson } from "../../../hooks/useFirebaseLesson";

import LessonPlayer from "../../../components/lessonsScreen/player/LessonPlayer";
import LessonScreenWrapper from "../../../components/lessonsScreen/player/LessonScreenWrapper";
import LessonCenterMessage from "../../../components/lessonsScreen/player/LessonCenterMessage";

const LessonDetails = () => {
  const router = useRouter();
  const { lessonId, mode } = useLocalSearchParams();

  const isReviewMode = mode === "review";

  const {
    lesson,
    loadingLesson,
    lessonError,
  } = useFirebaseLesson(lessonId);

  if (loadingLesson) {
    return (
      <LessonScreenWrapper>
        <LessonCenterMessage loading message="Loading lesson..." />
      </LessonScreenWrapper>
    );
  }

  if (lessonError) {
    return (
      <LessonScreenWrapper>
        <LessonCenterMessage
          error
          message={lessonError}
          buttonText="Go Back"
          onButtonPress={() => router.back()}
        />
      </LessonScreenWrapper>
    );
  }

  if (!lesson) {
    return (
      <LessonScreenWrapper>
        <LessonCenterMessage
          error
          message="Lesson data is empty."
          buttonText="Go Back"
          onButtonPress={() => router.back()}
        />
      </LessonScreenWrapper>
    );
  }

  return (
    <LessonPlayer
      lesson={lesson}
      isReviewMode={isReviewMode}
      onBack={() => router.back()}
    />
  );
};

export default LessonDetails;