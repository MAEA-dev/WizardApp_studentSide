import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatar,
  getWizardAvatarId,
} from "../../constants/wizardAvatars";
import { getStudentFromFirebase } from "../../services/studentDataService";
import SpriteSheet from "../shared/SpriteSheet";
import { connectToRoom } from "./firebaseRelay";

/* ---------- palette ---------- */
const C = {
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

/* ---------- game data ---------- */
const MAX_HP = 20;
const CARDS = [
  {
    id: "bolt",
    name: "Thunder Bolt",
    cost: 1,
    dmg: 3,
    icon: "⚡",
    color: "#f6c945",
    text: "Retribution. Deals 3 damage.",
  },
  {
    id: "ward",
    name: "Ward",
    cost: 2,
    sh: 5,
    icon: "🛡️",
    color: "#4aa3ff",
    text: "Block. Block. Block - Absorbs 5 damage.",
  },
  {
    id: "fire",
    name: "Fire Tempest",
    cost: 2,
    dmg: 6,
    icon: "🔥",
    color: "#ff7a3d",
    text: "Incinerate. Deals 6 damage.",
  },
  {
    id: "heal",
    name: "Mend",
    cost: 2,
    heal: 5,
    icon: "💚",
    color: "#4ade80",
    text: "I wanna heal, I wanna feel, what I thought was never real. Heals 5.",
  },
  {
    id: "drain",
    name: "Soul Drain",
    cost: 3,
    dmg: 4,
    heal: 2,
    icon: "🌙",
    color: "#b57bff",
    text: "Death by snu snu. Deals 4 damage and heals 2.",
  },
  {
    id: "meteor",
    name: "Meteor",
    cost: 5,
    dmg: 10,
    icon: "☄️",
    color: "#ff4d4d",
    text: "Dinosaurs be damned. Deals 10 damage.",
  },
];
const PER_PAGE = 3;
const other = (w) => (w === "me" ? "opp" : "me");
const manaFor = (turns) => Math.min(6, 2 + turns);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const fresh = (iGoFirst) => ({
  me: { hp: MAX_HP, sh: 0, mana: iGoFirst ? 3 : 0 },
  opp: { hp: MAX_HP, sh: 0, mana: iGoFirst ? 0 : 3 },
  turn: iGoFirst ? "me" : "opp",
  turns: { me: iGoFirst ? 1 : 0, opp: iGoFirst ? 0 : 1 },
  hits: { me: 0, opp: 0 },
  manaUses: { me: 0, opp: 0 },
  log: iGoFirst
    ? "The duel begins. You strike first."
    : "The duel begins. Rival strikes first.",
});

// Both phones run the same reducer on the same actions, so they stay in sync.
function reducer(s, a) {
  if (a.t === "reset") return fresh(a.first);
  if (s.me.hp <= 0 || s.opp.hp <= 0 || s.turn !== a.who) return s;
  const who = a.who,
    foe = other(who);
  if (a.t === "end") {
    const turns = { ...s.turns, [foe]: s.turns[foe] + 1 };
    return {
      ...s,
      turn: foe,
      turns,
      [foe]: { ...s[foe], mana: manaFor(turns[foe]) },
      log: `${foe === "me" ? "Your" : "Rival's"} turn.`,
    };
  }
  const card = CARDS.find((c) => c.id === a.id);
  if (!card || s[who].mana < card.cost) return s;
  const me = { ...s[who], mana: s[who].mana - card.cost };
  const foeS = { ...s[foe] };
  const hits = { ...s.hits };
  const manaUses = { ...s.manaUses, [who]: s.manaUses[who] + 1 };
  if (card.dmg) {
    const soak = Math.min(foeS.sh, card.dmg);
    foeS.sh -= soak;
    const damage = card.dmg - soak;
    foeS.hp = Math.max(0, foeS.hp - damage);
    if (damage > 0) hits[foe] += 1;
  }
  if (card.sh) me.sh += card.sh;
  if (card.heal) me.hp = Math.min(MAX_HP, me.hp + card.heal);
  return {
    ...s,
    [who]: me,
    [foe]: foeS,
    hits,
    manaUses,
    log: `${who === "me" ? "You" : "Rival"} cast ${card.name}!`,
  };
}

function HitShake({ hits, children, style }) {
  const shake = useRef(new Animated.Value(0)).current;
  const previousHits = useRef(hits);
  useEffect(() => {
    if (hits <= previousHits.current) {
      previousHits.current = hits;
      return;
    }
    previousHits.current = hits;
    shake.setValue(0);
    Animated.sequence(
      [-6, 6, -4, 4, 0].map((v) =>
        Animated.timing(shake, {
          toValue: v,
          duration: 45,
          useNativeDriver: true,
        }),
      ),
    ).start();
    return () => shake.stopAnimation();
  }, [hits, shake]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shake }] }]}>
      {children}
    </Animated.View>
  );
}

function Wizard({ avatarId, hits, flip }) {
  const avatar = getWizardAvatar(avatarId);
  return (
    <HitShake hits={hits} style={st.wizard}>
      <View style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
        <SpriteSheet
          source={avatar.source}
          frameCount={avatar.frameCount}
          scale={1}
        />
      </View>
    </HitShake>
  );
}

function Bar({ value, max, color }) {
  return (
    <View style={st.barTrack}>
      <View
        style={[
          st.barFill,
          { width: `${(value / max) * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

function Stats({ p, label, align, hits, manaUses }) {
  return (
    <View style={{ alignItems: align, width: "100%" }}>
      <HitShake hits={hits} style={{ width: "100%" }}>
        <>
          <Text style={st.name}>
            {label} {p.hp}/{MAX_HP}
            {p.sh ? `  🛡️${p.sh}` : ""}
          </Text>
          <Bar value={p.hp} max={MAX_HP} color={C.ember} />
        </>
      </HitShake>
      <HitShake hits={manaUses}>
        <Text style={st.mana}>
          {"◆".repeat(p.mana)}
          <Text style={{ opacity: 0.25 }}>
            {"◇".repeat(Math.max(0, 6 - p.mana))}
          </Text>
        </Text>
      </HitShake>
    </View>
  );
}

/* ---------- spellbook ---------- */
function SpellCard({ card, enabled, onPlay }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const play = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.06,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
    onPlay(card.id);
  };

  return (
    <AnimatedPressable
      disabled={!enabled}
      onPress={play}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        st.card,
        { borderColor: card.color, opacity: enabled ? 1 : 0.4 },
        {
          transform: [
            { scale },
            ...(pressed ? [{ translateY: -8 }] : []),
          ],
        },
      ]}
    >
      <View style={[st.cost, { backgroundColor: card.color }]}>
        <Text style={st.costTxt}>{card.cost}</Text>
      </View>
      <Text style={st.cardIcon}>{card.icon}</Text>
      <Text style={st.cardName}>{card.name}</Text>
      <Text style={st.cardText}>{card.text}</Text>
    </AnimatedPressable>
  );
}

function Book({ s, onPlay }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(CARDS.length / PER_PAGE);
  const mine = s.turn === "me" && s.me.hp > 0 && s.opp.hp > 0;
  return (
    <HitShake hits={s.hits.me} style={st.bookWrap}>
      <View style={st.book}>
        <View style={st.bookHead}>
          <Pressable
            onPress={() => setPage((p) => (p + pages - 1) % pages)}
            hitSlop={12}
          >
            <Text style={st.flip}>‹</Text>
          </Pressable>
          <Text style={st.bookTitle}>
            Spellbook · page {page + 1} of {pages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => (p + 1) % pages)}
            hitSlop={12}
          >
            <Text style={st.flip}>›</Text>
          </Pressable>
        </View>
        <View style={st.pageRow}>
          {CARDS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((c) => {
            const ok = mine && s.me.mana >= c.cost;
            return (
              <SpellCard key={c.id} card={c} enabled={ok} onPlay={onPlay} />
            );
          })}
        </View>
      </View>
    </HitShake>
  );
}

/* ---------- screens ---------- */
function Lobby({ room, setRoom, status, onJoin }) {
  return (
    <View style={st.lobby}>
      <Text style={st.logo}>Wizard Duel</Text>
      <Text style={st.sub}>
        Two phones, one spellbook each. Choose words to meet.
      </Text>
      <Text style={st.label}>Shared room words</Text>
      <TextInput
        style={st.input}
        value={room}
        onChangeText={setRoom}
        placeholder="Enter the same words on both phones"
        placeholderTextColor="#8f83bd"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={80}
      />
      <Pressable style={st.btn} onPress={onJoin}>
        <Text style={st.btnTxt}>Enter the duel</Text>
      </Pressable>
      {!!status && <Text style={st.status}>{status}</Text>}
    </View>
  );
}

function Duel({
  s,
  send,
  dispatch,
  rematch,
  leave,
  surrender,
  opponentAvatarId,
  opponentUsername,
}) {
  const over = s.me.hp <= 0 || s.opp.hp <= 0;
  const won = s.opp.hp <= 0;
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Surrender and exit the battle"
        style={st.exitBtn}
        onPress={surrender}
      >
        <Text style={st.exitBtnText}>←</Text>
      </Pressable>
      <View style={st.top}>
        <Stats
          p={s.opp}
          label={opponentUsername}
          align="center"
          hits={s.hits.opp}
          manaUses={s.manaUses.opp}
        />
        <Wizard avatarId={opponentAvatarId} hits={s.hits.opp} flip />
      </View>
      <View style={st.mid}>
        <Text style={st.log}>{s.log}</Text>
        <Pressable
          disabled={s.turn !== "me" || over}
          style={[st.endBtn, (s.turn !== "me" || over) && { opacity: 0.35 }]}
          onPress={() => {
            dispatch({ t: "end", who: "me" });
            send({ type: "end" });
          }}
        >
          <Text style={st.btnTxt}>
            {s.turn === "me" ? "End turn" : "Rival's turn…"}
          </Text>
        </Pressable>
      </View>
      <View style={st.mine}>
        <Stats
          p={s.me}
          label="You"
          align="flex-start"
          hits={s.hits.me}
          manaUses={s.manaUses.me}
        />
      </View>
      <Book
        s={s}
        onPlay={(id) => {
          dispatch({ t: "play", who: "me", id });
          send({ type: "play", id });
        }}
      />
      {over && (
        <View style={st.overlay}>
          <Text style={st.logo}>{won ? "Victory!" : "Defeated"}</Text>
          <Pressable style={st.btn} onPress={rematch}>
            <Text style={st.btnTxt}>Rematch</Text>
          </Pressable>
          <Pressable style={[st.btn, st.ghost]} onPress={leave}>
            <Text style={st.btnTxt}>Leave</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ---------- app / networking ---------- */
export default function App() {
  const [phase, setPhase] = useState("lobby"); // lobby | wait | duel
  const [room, setRoom] = useState("");
  const [status, setStatus] = useState("");
  const [opponentAvatarId, setOpponentAvatarId] = useState(
    DEFAULT_WIZARD_AVATAR,
  );
  const [opponentUsername, setOpponentUsername] = useState("Opponent");
  const [s, dispatch] = useReducer(reducer, fresh(true));
  const relay = useRef(null);
  const joining = useRef(false);
  const surrendering = useRef(false);
  const joinAttempt = useRef(0);

  const send = (move) => {
    relay.current?.send(move).catch((error) => {
      console.error("Unable to send PvP move:", error);
      setStatus(`Unable to send move: ${error.message}`);
    });
  };
  const leave = () => {
    joinAttempt.current += 1;
    joining.current = false;
    const currentRelay = relay.current;
    relay.current = null;
    setPhase("lobby");
    if (currentRelay) {
      currentRelay.leave().catch((error) => {
        console.error("Unable to leave PvP room:", error);
        setStatus(`Unable to leave room: ${error.message}`);
      });
    }
  };
  const surrender = useCallback(async () => {
    if (surrendering.current) return;
    const currentRelay = relay.current;
    if (!currentRelay) {
      setStatus("Unable to surrender: your room connection is unavailable.");
      return;
    }

    surrendering.current = true;
    try {
      const cleanupComplete = await currentRelay.surrender();
      if (relay.current === currentRelay) relay.current = null;
      joinAttempt.current += 1;
      joining.current = false;
      dispatch({ t: "reset", first: true });
      setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
      setOpponentUsername("Opponent");
      setPhase("lobby");
      setStatus(
        cleanupComplete
          ? "You surrendered. The room is ready for a new battle."
          : "You surrendered, but some battle data could not be cleared.",
      );
    } catch (error) {
      console.error("Unable to surrender from PvP room:", error);
      setStatus(`Unable to surrender: ${error.message}`);
    } finally {
      surrendering.current = false;
    }
  }, []);

  useEffect(() => {
    if (phase !== "duel") return undefined;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        surrender();
        return true;
      },
    );
    return () => subscription.remove();
  }, [phase, surrender]);

  const join = async () => {
    if (joining.current) return;
    if (!room.trim()) {
      setStatus("Enter the words your rival will use to join.");
      return;
    }

    joining.current = true;
    const attempt = ++joinAttempt.current;
    setStatus("Preparing arena...");
    setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
    setOpponentUsername("Opponent");
    setPhase("wait");

    try {
      const student = await getStudentFromFirebase();
      const username = String(student.username || "").trim();
      if (!username) {
        throw new Error("Your account is missing a username.");
      }

      const currentRelay = await connectToRoom(room, {
        avatarId: DEFAULT_WIZARD_AVATAR,
        username,
        onOpponentAvatar: setOpponentAvatarId,
        onOpponentUsername: setOpponentUsername,
        onStart: ({ first, avatarId, username: rivalUsername }) => {
          setOpponentAvatarId(getWizardAvatarId(avatarId));
          setOpponentUsername(rivalUsername || "Opponent");
          dispatch({ t: "reset", first });
          setStatus("");
          setPhase("duel");
        },
        onWait: ({ reconnecting }) => {
          setPhase("wait");
          setStatus(
            reconnecting
              ? "Your rival left. Waiting for another wizard…"
              : "Your rival left the duel.",
          );
        },
        onSurrender: ({ username: rivalUsername, acknowledge }) => {
          relay.current = null;
          dispatch({ t: "reset", first: true });
          setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
          setOpponentUsername("Opponent");
          setPhase("lobby");
          const message = `${rivalUsername || "Your opponent"} surrendered. You win!`;
          setStatus(message);
          Alert.alert("Battle ended", message);
          acknowledge().catch((error) => {
            console.error("Unable to clear surrendered PvP room:", error);
          });
        },
        onMove: (move) => {
          if (move.type === "play")
            dispatch({ t: "play", who: "opp", id: move.id });
          else if (move.type === "end") dispatch({ t: "end", who: "opp" });
          else if (move.type === "rematch")
            dispatch({ t: "reset", first: true });
        },
        onError: (error) => {
          console.error("Firebase PvP relay error:", error);
          setStatus(`Firebase connection failed: ${error.message}`);
          setPhase("lobby");
          const currentRelay = relay.current;
          relay.current = null;
          currentRelay?.leave().catch((leaveError) => {
            console.error("Unable to leave failed PvP room:", leaveError);
          });
        },
      });
      if (attempt !== joinAttempt.current) {
        await currentRelay.leave();
        return;
      }
      relay.current = currentRelay;
      setStatus("");
    } catch (error) {
      if (attempt !== joinAttempt.current) return;
      console.error("Unable to join PvP room:", error);
      setPhase("lobby");
      setStatus(
        error.code === "ROOM_FULL"
          ? "That room already has two wizards."
          : `Unable to join room: ${error.message}`,
      );
    } finally {
      if (attempt === joinAttempt.current) joining.current = false;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={st.root}>
        {phase === "lobby" && (
          <Lobby {...{ room, setRoom, status, onJoin: join }} />
        )}
        {phase === "wait" && (
          <View style={st.lobby}>
            <Text style={st.logo}>Waiting…</Text>
            <Text style={st.sub}>
              Waiting for someone who entered the same room words.
            </Text>
            {!!status && <Text style={st.status}>{status}</Text>}
            <Pressable style={[st.btn, st.ghost]} onPress={leave}>
              <Text style={st.btnTxt}>Cancel</Text>
            </Pressable>
          </View>
        )}
        {phase === "duel" && (
          <Duel
            s={s}
            send={send}
            dispatch={dispatch}
            leave={leave}
            surrender={surrender}
            opponentAvatarId={opponentAvatarId}
            opponentUsername={opponentUsername}
            rematch={() => {
              dispatch({ t: "reset", first: false });
              send({ type: "rematch" });
            }}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ---------- styles (the "CSS") ---------- */
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  lobby: { flex: 1, padding: 28, justifyContent: "center", gap: 8 },
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
  label: { color: "#b9b0dd", marginTop: 8 },
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
  ghost: { backgroundColor: "#4b3b94" },
  btnTxt: { color: C.ink, fontWeight: "800", fontSize: 16 },
  status: { color: "#ff9b86", textAlign: "center", marginTop: 12 },

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
  exitBtnText: { color: "#fff", fontWeight: "800", fontSize: 42 },
  top: {
    flex: 4,
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 40,
    backgroundColor: C.dusk,
  },
  mid: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: C.night,
    gap: 6,
  },
  log: { color: C.teal, fontSize: 15, fontWeight: "600" },
  endBtn: {
    backgroundColor: C.gold,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  mine: { paddingHorizontal: 20, paddingBottom: 6 },
  name: { color: "#fff", fontWeight: "700", marginBottom: 4 },
  mana: { color: C.teal, letterSpacing: 3, marginTop: 4, fontSize: 14 },
  barTrack: {
    height: 10,
    width: "100%",
    backgroundColor: "#0c0920",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%" },

  wizard: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  bookWrap: {
    flex: 5,
    paddingHorizontal: 8,
    paddingBottom: 6,
    justifyContent: "flex-end",
  },
  book: {
    backgroundColor: C.leather,
    borderRadius: 16,
    padding: 10,
    borderWidth: 3,
    borderColor: C.leatherLo,
    transform: [{ perspective: 700 }, { rotateX: "14deg" }],
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  bookHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  bookTitle: { color: C.gold, fontFamily: "serif", fontWeight: "700" },
  flip: { color: C.gold, fontSize: 30, paddingHorizontal: 10 },
  pageRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: C.page,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
  },
  card: {
    flex: 1,
    minHeight: 150,
    backgroundColor: "#fff8e6",
    borderRadius: 10,
    borderWidth: 3,
    padding: 6,
    alignItems: "center",
  },
  cost: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  costTxt: { fontWeight: "800", color: C.ink },
  cardIcon: { fontSize: 38, marginTop: 14 },
  cardName: {
    color: C.ink,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
  },
  cardText: {
    color: "#5b4a35",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,30,0.88)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
