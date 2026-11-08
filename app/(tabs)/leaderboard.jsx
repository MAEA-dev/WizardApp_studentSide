import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Fonts } from "../../constants/Fonts";
import { useLeaderboard } from "../../hooks/useLeaderboard";

const MODES = [
  { id: "overall", label: "Overall" },
  { id: "pvp", label: "PvP" },
  { id: "pve", label: "PvE" },
];

export default function LeaderboardScreen() {
  const {
    leaderboard,
    loading,
    error,
    refresh,
    mode,
    setMode,
  } = useLeaderboard();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headingRow}>
          <Ionicons name="trophy" size={26} color="#FFD86B" />
          <Text style={styles.heading}>Leaderboard</Text>
        </View>
        <Text style={styles.subtitle}>The strongest wizards rise here.</Text>
      </View>

      <View style={styles.modeTabs}>
        {MODES.map((tab) => {
          const selected = mode === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setMode(tab.id)}
              style={[styles.modeTab, selected && styles.modeTabSelected]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  selected && styles.modeTabTextSelected,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#FFD86B"
            colors={["#FFD86B"]}
          />
        }
      >
        {loading && leaderboard.length === 0 ? (
          <View style={styles.message}>
            <ActivityIndicator size="large" color="#FFD86B" />
            <Text style={styles.messageText}>Loading rankings…</Text>
          </View>
        ) : error ? (
          <View style={styles.message}>
            <Ionicons name="cloud-offline-outline" size={30} color="#FFB4A7" />
            <Text style={styles.messageText}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.message}>
            <Ionicons name="sparkles-outline" size={32} color="#FFD86B" />
            <Text style={styles.messageTitle}>No rankings yet</Text>
            <Text style={styles.messageText}>
              Finish a {mode === "overall" ? "battle" : `${mode.toUpperCase()} battle`} to
              claim the first place.
            </Text>
          </View>
        ) : (
          <>
            {leaderboard.map((player) => (
              <View
                key={player.uid}
                style={[
                  styles.playerCard,
                  player.rank === 1 && styles.firstPlaceCard,
                ]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    player.rank === 1 && styles.firstPlaceBadge,
                  ]}
                >
                  {player.rank === 1 ? (
                    <Ionicons name="trophy" size={17} color="#211638" />
                  ) : (
                    <Text style={styles.rankText}>#{player.rank}</Text>
                  )}
                </View>
                <View style={styles.playerDetails}>
                  <Text numberOfLines={1} style={styles.username}>
                    {player.username}
                  </Text>
                  <Text style={styles.record}>
                    {player.wins} wins · {player.losses} losses
                  </Text>
                </View>
                <View style={styles.rate}>
                  <Text style={styles.rateValue}>{player.winRate}%</Text>
                  <Text style={styles.rateLabel}>WIN RATE</Text>
                </View>
              </View>
            ))}
            <Text style={styles.rankingNote}>
              Ranked by wins, then win rate.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#130B2B",
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heading: {
    color: "#FFF4D2",
    fontFamily: Fonts.heading,
    fontSize: 25,
  },
  subtitle: {
    color: "#BFA7FF",
    fontFamily: Fonts.body,
    fontSize: 14,
    marginTop: 5,
  },
  modeTabs: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#211944",
    borderWidth: 1,
    borderColor: "#493778",
  },
  modeTab: {
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  modeTabSelected: {
    backgroundColor: "#FFD86B",
  },
  modeTabText: {
    color: "#C9B9F0",
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
  },
  modeTabTextSelected: {
    color: "#211638",
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 20,
  },
  playerCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 15,
    backgroundColor: "#211944",
    borderWidth: 1,
    borderColor: "#493778",
  },
  firstPlaceCard: {
    backgroundColor: "#33264C",
    borderColor: "#FFD86B",
  },
  rankBadge: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRadius: 13,
    backgroundColor: "#34285C",
  },
  firstPlaceBadge: {
    backgroundColor: "#FFD86B",
  },
  rankText: {
    color: "#EEE5FF",
    fontFamily: Fonts.pixel,
    fontSize: 11,
  },
  playerDetails: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    color: "#FFF4D2",
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
  },
  record: {
    color: "#BFA7FF",
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  rate: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  rateValue: {
    color: "#FFD86B",
    fontFamily: Fonts.pixel,
    fontSize: 14,
  },
  rateLabel: {
    color: "#BFA7FF",
    fontFamily: Fonts.bodyBold,
    fontSize: 8,
    marginTop: 4,
  },
  message: {
    flex: 1,
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  messageTitle: {
    color: "#FFF4D2",
    fontFamily: Fonts.heading,
    fontSize: 20,
    textAlign: "center",
  },
  messageText: {
    color: "#C9B9F0",
    fontFamily: Fonts.body,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFD86B",
  },
  retryText: {
    color: "#211638",
    fontFamily: Fonts.bodyBold,
  },
  rankingNote: {
    color: "#8F80B4",
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
