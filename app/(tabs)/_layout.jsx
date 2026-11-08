import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../constants/Fonts";

const TabIcon = ({ name, focused, color }) => {
  return (
    <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "shift",
          tabBarActiveTintColor: "#FFD86B",
          tabBarInactiveTintColor: "#BFA7FF",

          tabBarStyle: [
            styles.tabBar,
            {
              height: 72 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            },
          ],

          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? "home" : "home-outline"}
                focused={focused}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="lessons"
          options={{
            title: "Lessons",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? "book" : "book-outline"}
                focused={focused}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="battle"
          options={{
            title: "Battle",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? "shield" : "shield-outline"}
                focused={focused}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Leaderboard",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? "trophy" : "trophy-outline"}
                focused={focused}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? "person" : "person-outline"}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#130B2B",
  },

  tabBar: {
    backgroundColor: "#19143A",

    borderTopWidth: 2,
    borderTopColor: "#7557D9",

    paddingTop: 8,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
  },

  tabBarLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    marginTop: 2,
  },

  tabBarItem: {
    paddingVertical: 4,
  },

  iconBox: {
    width: 38,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBoxActive: {
    backgroundColor: "rgba(255, 216, 107, 0.18)",
    borderWidth: 1,
    borderColor: "#FFD86B",
  },
});