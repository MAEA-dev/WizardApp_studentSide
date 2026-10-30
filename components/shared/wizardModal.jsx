import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";

import { Fonts } from "../../constants/Fonts";

const wizardImages = {
  default: require("../../assets/images/wizardSmile.png"),
  success: require("../../assets/images/wizardSucces.png"),
  wrong: require("../../assets/images/wizardSad.png"),
  complete: require("../../assets/images/wizardCelebrate.png"),
};

export default function WizardMessage({
  visible,
  onClose,
  title = "Wizard Guide",
  message = "What would you like to learn today?",
  buttonText = "NEXT",
  type = "default",
}) {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const isWideScreen = width > 420;

  const wizardSize = Math.min(width * 0.48, isSmallScreen ? 145 : 185);

  const horizontalPadding = width * 0.045;
  const boxPadding = width * 0.055;

  const selectedWizard = wizardImages[type] || wizardImages.default;

  const getThemeColor = () => {
    if (type === "success") return "#64E6A8";
    if (type === "wrong") return "#FF7A7A";
    if (type === "complete") return "#FFD86B";
    return "#FFD86B";
  };

  const getButtonText = () => {
    if (type === "success") return "CONTINUE";
    if (type === "wrong") return "CONTINUE";
    if (type === "complete") return "CLAIM";
    return buttonText;
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialogArea,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: wizardSize * 0.68,
              maxWidth: isWideScreen ? 430 : "100%",
            },
          ]}
        >
          <View
            style={[
              styles.wizardContainer,
              {
                width: wizardSize,
                height: wizardSize,
                left: horizontalPadding,
                top: -12,
              },
            ]}
          >
            <Image
              source={selectedWizard}
              style={styles.wizardImage}
              resizeMode="contain"
            />
          </View>

          <View
            style={[
              styles.messageBox,
              {
                minHeight: isSmallScreen ? 145 : 175,
                paddingTop: isSmallScreen ? 18 : 22,
                paddingHorizontal: boxPadding,
                paddingBottom: isSmallScreen ? 14 : 18,
                borderColor: getThemeColor(),
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  fontSize: isSmallScreen ? 18 : 21,
                  color: getThemeColor(),
                },
              ]}
            >
              {title}
            </Text>

            <Text
              style={[
                styles.message,
                {
                  fontSize: isSmallScreen ? 15 : 17,
                  lineHeight: isSmallScreen ? 22 : 25,
                },
              ]}
            >
              {message}
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.button,
                  {
                    paddingVertical: isSmallScreen ? 8 : 13,
                    paddingHorizontal: isSmallScreen ? 14 : 16,
                    paddingTop: 13,
                    backgroundColor: getThemeColor(),
                  },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      fontSize: isSmallScreen ? 9 : 12,
                    },
                  ]}
                >
                  {getButtonText()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 4, 20, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  dialogArea: {
    width: "100%",
    position: "relative",
  },

  wizardContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },

  wizardImage: {
    width: "100%",
    height: "100%",
  },

  messageBox: {
    width: "100%",
    backgroundColor: "rgba(32, 20, 67, 0.97)",
    borderWidth: 3,
    borderRadius: 24,
    zIndex: 2,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },

  title: {
    fontFamily: Fonts.heading,
    marginBottom: 8,
  },

  message: {
    fontFamily: Fonts.body,
    color: "#FFFFFF",
  },

  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  button: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  buttonText: {
    fontFamily: Fonts.pixel,
    color: "#21103F",
  },
});