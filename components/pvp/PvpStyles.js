import { StyleSheet } from "react-native";

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

  logo: {
    color: C.gold,
    fontSize: 40,
    fontWeight: "800",
    fontFamily: "serif",
    textAlign: "center",
  },

  sub: {
    color: "#b9b0dd",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },

  label: {
    color: "#b9b0dd",
    marginTop: 8,
  },

  input: {
    backgroundColor: C.dusk,
    color: "#fff",
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
  },

  ghost: {
    backgroundColor: "#4b3b94",
  },

  btnTxt: {
    color: C.ink,
    fontWeight: "800",
    fontSize: 16,
  },

  status: {
    color: "#ff9b86",
    textAlign: "center",
    marginTop: 12,
  },

  exitBtn: {
    position: "absolute",
    top: 8,
    left: 12,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "transparent",
  },

  exitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 42,
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
    color: C.teal,
    fontSize: 15,
    fontWeight: "600",
  },

  endBtn: {
    backgroundColor: C.gold,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  
  },

  mine: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,30,0.88)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});