import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../constants/Fonts";
import { allocateStatPoint } from "../../services/studentStatsService";

const STAT_OPTIONS = [
  {
    id: "hp",
    label: "HP",
    description: "+10 Health",
    icon: "heart-outline",
  },
  {
    id: "power",
    label: "Power",
    description: "+2 Power",
    icon: "flash-outline",
  },
  {
    id: "energy",
    label: "Energy",
    description: "+1 Energy",
    icon: "battery-charging-outline",
  },
];

const getSafePoints = (value) => {
  const points = Number(value || 0);

  return Number.isFinite(points) ? points : 0;
};

const HomeStatAllocationModal = ({
  visible,
  level,
  statPoints,
  onClose,
  onStudentUpdated,
}) => {
  const [localPoints, setLocalPoints] = useState(0);
  const [allocatingStat, setAllocatingStat] = useState(null);
  const [error, setError] = useState(null);

  const hasPoints = localPoints > 0;
  const isAllocating = !!allocatingStat;
  const canClose = !hasPoints && !isAllocating;

  useEffect(() => {
    setLocalPoints(getSafePoints(statPoints));
    setAllocatingStat(null);
    setError(null);
  }, [statPoints, visible]);

  const handleAllocate = async (statType) => {
    if (!hasPoints || isAllocating) return;

    try {
      setError(null);
      setAllocatingStat(statType);

      const result = await allocateStatPoint(statType);

      if (result?.student) {
        setLocalPoints(getSafePoints(result.student.statPoints));
        onStudentUpdated?.(result.student);
      }
    } catch (err) {
      console.log("Allocate stat point error:", err);
      setError(err?.message || "Failed to allocate stat point.");
    } finally {
      setAllocatingStat(null);
    }
  };

  const handleClose = () => {
    if (!canClose) return;

    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={34} color="#FFD86B" />
          </View>

          <Text style={styles.title}>Level Up!</Text>

          <Text style={styles.subtitle}>
            Your wizard reached Level {level}. Use your stat points to grow
            stronger.
          </Text>

          <View style={styles.pointsBox}>
            <Text style={styles.pointsLabel}>Available Stat Points</Text>
            <Text style={styles.pointsValue}>{localPoints}</Text>
          </View>

          {STAT_OPTIONS.map((stat) => {
            const loading = allocatingStat === stat.id;
            const disabled = !hasPoints || isAllocating;

            return (
              <TouchableOpacity
                key={stat.id}
                activeOpacity={0.85}
                style={[
                  styles.statButton,
                  disabled && styles.disabledButton,
                ]}
                onPress={() => handleAllocate(stat.id)}
                disabled={disabled}
              >
                <View style={styles.statIcon}>
                  <Ionicons name={stat.icon} size={23} color="#FFD86B" />
                </View>

                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statDescription}>
                    {stat.description}
                  </Text>
                </View>

                {loading ? (
                  <ActivityIndicator size="small" color="#FFD86B" />
                ) : (
                  <Ionicons
                    name="add-circle-outline"
                    size={23}
                    color="#FFD86B"
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.closeButton,
              !canClose && styles.disabledCloseButton,
            ]}
            onPress={handleClose}
            disabled={!canClose}
          >
            <Text style={styles.closeButtonText}>
              {canClose ? "Continue" : "Use all points first"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default HomeStatAllocationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#19143A",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 26,
    padding: 20,
    alignItems: "center",
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255, 216, 107, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 26,
    color: "#FFD86B",
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#EDE7FF",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },

  pointsBox: {
    width: "100%",
    backgroundColor: "rgba(117, 87, 217, 0.35)",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
  },

  pointsLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
  },

  pointsValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 28,
    color: "#FFD86B",
    marginTop: 2,
  },

  statButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(42, 34, 86, 0.95)",
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
  },

  disabledButton: {
    opacity: 0.55,
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#FFFFFF",
  },

  statDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#D8CFFF",
    marginTop: 3,
  },

  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FF8A8A",
    textAlign: "center",
    marginTop: 4,
  },

  closeButton: {
    width: "100%",
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  disabledCloseButton: {
    opacity: 0.45,
  },

  closeButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#130B2B",
  },
});