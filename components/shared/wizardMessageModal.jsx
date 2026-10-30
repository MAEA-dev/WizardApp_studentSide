import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import SpriteSheet from "./SpriteSheet";
import { Fonts } from "../../constants/Fonts";

export default function WizardMessageModal({
  visible,
  onClose,
  title = "Wizard Guide",
  message = "What would you like to learn today",
  buttonText = "NEXT",
}) {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const isWideScreen = width > 420;

  const wizardSize = Math.min(width * 0.48, isSmallScreen ? 145 : 185);
  const wizardScale = wizardSize / 100;

  const horizontalPadding = width * 0.045;
  const boxPadding = width * 0.055;

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
              paddingTop: wizardSize * 0.7,
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
                top: 0,
              },
            ]}
          >
            <SpriteSheet
              source={require("../../assets/images/wizardIdle.png")}
              fps={7}
              scale={wizardScale}
              frameCount={4}
              loopDelay={3000}
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
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  fontSize: isSmallScreen ? 18 : 21,
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
                style={[
                  styles.button,
                  {
                    paddingVertical: isSmallScreen ? 8 : 13,
                    paddingHorizontal: isSmallScreen ? 14 : 16,
                    paddingTop: 13
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
                  {buttonText}
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
    zIndex: 1,
  },

  messageBox: {
    width: "100%",
    backgroundColor: "rgba(32, 20, 67, 0.97)",
    borderWidth: 3,
    borderColor: "#FFD86B",
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
    color: "#FFD86B",
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
    backgroundColor: "#FFD86B",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  buttonText: {
    fontFamily: Fonts.pixel,
    color: "#21103F",
  },
});