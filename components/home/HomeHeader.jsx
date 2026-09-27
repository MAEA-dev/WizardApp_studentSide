import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Fonts , FontSizes} from "../../constant/Fonts";
import { useRouter } from "expo-router";


export default function HomeHeader({ student, layout }) {
  const router = useRouter();
  const { avatarSize, isSmall, isVerySmall, isNarrow } = layout;

  return (
    <View
      style={[
        styles.header,
        {
          padding: isSmall ? 5 : 8,
          marginBottom: isSmall ? 7 : 9,
        },
      ]}
    >
      
      <View style={styles.profileLeft}>
      <TouchableOpacity onPress={() => router.push("/profile")}>
        <View
          style={[
            styles.avatarBox,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={{
              width: avatarSize * 1.25,
              height: avatarSize * 1.25,
            }}
            resizeMode="contain"
          />
        </View>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.name,
              {
                fontSize: isVerySmall ? 10 : isSmall ? 16 : 19,
              },
            ]}
            numberOfLines={1}
          >
            {student.username}
          </Text>

          <Text
            style={[
              styles.role,
              {
                fontSize: isVerySmall ? 5 : 8,
              },
            ]}
            numberOfLines={1}
          >
             Grade {student.profile.grade}
          </Text>

          <View style={styles.levelBadge}>
            <Text style={styles.level}>Level {student.level}</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.rewardBox,
          {
            minWidth: isNarrow ? 82 : 100,
            paddingVertical: isSmall ? 6 : 8,
            paddingHorizontal: isSmall ? 8 : 10,
          },
        ]}
      >
        <Text style={styles.rewardText}>🔥   {student.streak} Day</Text>
        <Text style={styles.coinText}>💰 {student.gold}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(25, 20, 58, 0.68)",
    borderWidth: 2,
    borderColor: "#A7B7FF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarBox: {
    backgroundColor: "#151833",
    borderWidth: 2,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 9,
  },

  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontFamily: Fonts.heading,
    color: "#FFD86B",
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: "capitalize"
  },

  role: {
    fontFamily: Fonts.pixel,
    color: "#2aea30",
    marginBottom: 4,
    marginLeft: 5,
    textTransform: "capitalize"
  },

  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#6B4DCB",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },

  level: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFFFFF",
  },

  rewardBox: {
    backgroundColor: "#342469",
    borderWidth: 2,
    borderColor: "#7B82E8",
    borderRadius: 11,
  },

  rewardText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#09e827",
    marginBottom: 5,
    
  },

  coinText: {
    fontFamily: Fonts.pixel,
    fontSize: 11,
    color: "#FFD86B",
  },
});