import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import React from "react";
import { useRouter } from "expo-router";

import { Fonts } from "../../constants/Fonts";
import { useHomeData } from "../../hooks/useHomeData";
import { useSubjectsWithLessons } from "../../hooks/useSubjectWithLessons";

import SubjectSection from "../../components/lessonsScreen/SubjectSection";
import LessonQuestCard from "../../components/lessonsScreen/LessonQuestCard";

const Lessons = () => {
  const router = useRouter();

  const { student, loadingCache } = useHomeData();

  const gradeLevel = student?.profile?.grade || student?.gradeLevel || student?.grade;

  const {
    subjects,
    loadingSubjects,
    subjectsError,
  } = useSubjectsWithLessons(gradeLevel);

  const handleLessonPress = (lesson) => {
    router.push({
      pathname: `/subjects/${lesson.subjectId}/${lesson.id}`,
      params: {
        mode: lesson.completed ? "review" : "start",
      },
    });
  };

  const isLoading = loadingCache || loadingSubjects;

  return (
    <ImageBackground
      source={require("../../assets/images/lessonsBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Lesson Library</Text>
          <LessonQuestCard/>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFD86B" />
            <Text style={styles.centerText}>Loading lessons...</Text>
          </View>
        ) : subjectsError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{subjectsError}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <SubjectSection
                  key={subject.id}
                  subject={subject}
                  onLessonPress={handleLessonPress}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                No subjects available for your grade level yet.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
};

export default Lessons;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 11, 43, 0.56)",
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    marginBottom: 14,
  },

  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: "#FFD86B",
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#EDE7FF",
    marginTop: 4,
  },

  content: {
    paddingBottom: 120,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  centerText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 10,
  },

  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FF8A8A",
    textAlign: "center",
  },

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#D8CFFF",
    textAlign: "center",
    marginTop: 20,
  },
});