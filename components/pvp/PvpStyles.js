import { StyleSheet } from "react-native";
import { Fonts } from "../../constants/Fonts";

export const C = {
  night: "#14102b",
  dusk: "#241a4d",
  leather: "#4a2a14",
  leatherLo: "#2e1a0c",
  page: "#efdfb8",
  ink: "#2b1d10",
  gold: "#e8b84a",
  ember: "#d9482b",
  teal: "#3fd0c9",
  skin: "#f2c9a0",
};

export const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.night,
  },

  lobby: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    gap: 8,
  },

  lobbyBackground: {
    flex: 1,
    width: "100%",
  },

  lobbyBackgroundImage: {
    opacity: 0.35,
  },

  lobbyBackdrop: {
    backgroundColor: "rgba(14, 8, 37, 0.34)",
  },

  logo: {
    color: C.gold,
    fontSize: 24,
    fontFamily: Fonts.heading,
    textAlign: "center",
  },

  waitingTitle: {
    color: C.gold,
    fontSize: 34,
    fontFamily: Fonts.heading,
    textAlign: "center",
  },

  lobbyLogo: {
    color: C.gold,
    fontSize: 40,
    fontWeight: "900",
    fontFamily: "serif",
    textAlign: "center",
  },

  sub: {
    color: "#a796eb",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
   textShadowOffset: { width: 2, height: 3 },
   textShadowRadius: 4,
  },

  label: {
    color: "#b9b0dd",
    fontFamily: Fonts.bodyBold,
    marginTop: 8,
  },

  input: {
    backgroundColor: C.dusk,
    color: "#fff",
    fontFamily: Fonts.body,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4b3b94",
  },

  btn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#FFF0C2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 4,
  },

  ghost: {
    backgroundColor: "#4b3b94",
    borderColor: "#8f7ed4",
  },

  btnTxt: {
    color: C.ink,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
  },

  status: {
    color: "#ff9b86",
    fontFamily: Fonts.bodyBold,
    textAlign: "center",
    marginTop: 12,
  },

  waitingRoomName: {
    color: C.gold,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    textAlign: "center",
  },

  exitBtn: {
    position: "absolute",
    top: 8,
    left: 12,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(75, 59, 148, 0.88)",
    borderWidth: 1,
    borderColor: "#8f7ed4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  exitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 25,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,6,30,0.78)",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    backgroundColor: C.dusk,
    borderWidth: 2,
    borderColor: C.gold,
    borderRadius: 18,
    padding: 24,
  },

  modalTitle: {
    color: C.gold,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  modalMessage: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 12,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  modalButton: {
    flex: 1,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFF0C2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },

  modalButtonSecondary: {
    backgroundColor: "#4b3b94",
  },

  modalSingleButton: {
    flex: 0,
    width: 140,
    alignSelf: "center",
    marginTop: 18,
  },

  modalButtonText: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "800",
  },

  modalButtonSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  top: {
    height: 280,
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 40,
    overflow: "hidden",
  },

  mid: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: C.night,
    gap: 6,
  },

  log: {
    fontFamily: Fonts.pixel,
    color: C.teal,
    width: "100%",
    textAlign: "center",
    paddingHorizontal: 12,
  },

  endBtn: {
    borderWidth: 3,
    borderColor: C.leatherLo,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 33,
    borderRadius: 20,
    alignSelf: "center",
    transform: [{ translateY: -20 }],
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 7 },
  },

  endBtnText: {
    fontSize: 24,
  },

  mine: {
    paddingHorizontal: 20,
  },

  mineAndBook: {
    flex: 7,
    minHeight: 0,
    justifyContent: "flex-end",
    gap: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,30,0.88)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
