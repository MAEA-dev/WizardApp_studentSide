import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../constants/Fonts";
import LessonCard from "./LessonCard";

const SubjectSection = ({ subject, onLessonPress }) => {
  const [expanded, setExpanded] = useState(false);

  const progressPercent = useMemo(() => {
    if (!subject.lessonCount) return 0;

    return Math.round((subject.completedLessons / subject.lessonCount) * 100);
  }, [subject.completedLessons, subject.lessonCount]);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.header,
          {
            borderColor: subject.color || "#7557D9",
          },
        ]}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <View style={styles.titleBox}>
          <View style={styles.titleRow}>
            <Text style={styles.subjectName}>{subject.name}</Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {subject.completedLessons}/{subject.lessonCount}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: subject.color || "#FFD86B",
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {progressPercent}% completed
          </Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.lessonList}>
          {subject.lessons.length > 0 ? (
            subject.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onPress={() => onLessonPress(lesson)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No lessons available yet.</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SubjectSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },

  header: {
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    borderWidth: 1.8,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  titleBox: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
  },

  subjectName: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 17,
    color: "#FFFFFF",
    textTransform: "capitalize",
  },

  countBadge: {
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  countText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#FFD86B",
  },

  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.13)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  progressText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#D8CFFF",
    marginTop: 5,
  },

  lessonList: {
    marginTop: 10,
  },

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
    textAlign: "center",
    marginTop: 8,
  },
});