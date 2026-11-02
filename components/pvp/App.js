import React, { useReducer, useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { connectToRoom } from './firebaseRelay';
import SpriteSheet from '../shared/SpriteSheet';
import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatar,
  getWizardAvatarId,
} from '../../constants/wizardAvatars';

/* ---------- palette ---------- */
const C = {
  night: '#14102b', dusk: '#241a4d', leather: '#4a2a14', leatherLo: '#2e1a0c',
  page: '#efdfb8', ink: '#2b1d10', gold: '#e8b84a', ember: '#d9482b',
  teal: '#3fd0c9', skin: '#f2c9a0',
};

/* ---------- game data ---------- */
const MAX_HP = 20;
const CARDS = [
  { id: 'bolt',   name: 'Arcane Bolt', cost: 1, dmg: 3,  icon: '⚡', color: '#f6c945', text: 'Deal 3' },
  { id: 'ward',   name: 'Ward',        cost: 1, sh: 4,   icon: '🛡️', color: '#4aa3ff', text: 'Shield 4' },
  { id: 'fire',   name: 'Fireball',    cost: 2, dmg: 5,  icon: '🔥', color: '#ff7a3d', text: 'Deal 5' },
  { id: 'heal',   name: 'Mend',        cost: 2, heal: 5, icon: '💚', color: '#4ade80', text: 'Heal 5' },
  { id: 'drain',  name: 'Soul Drain',  cost: 3, dmg: 4, heal: 4, icon: '🌙', color: '#b57bff', text: 'Deal 4, heal 4' },
  { id: 'meteor', name: 'Meteor',      cost: 5, dmg: 10, icon: '☄️', color: '#ff4d4d', text: 'Deal 10' },
];
const PER_PAGE = 3;
const other = (w) => (w === 'me' ? 'opp' : 'me');
const manaFor = (turns) => Math.min(6, 2 + turns);

const fresh = (iGoFirst) => ({
  me:  { hp: MAX_HP, sh: 0, mana: iGoFirst ? 3 : 0 },
  opp: { hp: MAX_HP, sh: 0, mana: iGoFirst ? 0 : 3 },
  turn: iGoFirst ? 'me' : 'opp',
  turns: { me: iGoFirst ? 1 : 0, opp: iGoFirst ? 0 : 1 },
  hits: { me: 0, opp: 0 },
  log: iGoFirst ? 'The duel begins. You strike first.' : 'The duel begins. Rival strikes first.',
});

// Both phones run the same reducer on the same actions, so they stay in sync.
function reducer(s, a) {
  if (a.t === 'reset') return fresh(a.first);
  if (s.me.hp <= 0 || s.opp.hp <= 0 || s.turn !== a.who) return s;
  const who = a.who, foe = other(who);
  if (a.t === 'end') {
    const turns = { ...s.turns, [foe]: s.turns[foe] + 1 };
    return { ...s, turn: foe, turns, [foe]: { ...s[foe], mana: manaFor(turns[foe]) },
      log: `${foe === 'me' ? 'Your' : "Rival's"} turn.` };
  }
  const card = CARDS.find((c) => c.id === a.id);
  if (!card || s[who].mana < card.cost) return s;
  const me = { ...s[who], mana: s[who].mana - card.cost };
  const foeS = { ...s[foe] };
  const hits = { ...s.hits };
  if (card.dmg) {
    const soak = Math.min(foeS.sh, card.dmg);
    foeS.sh -= soak;
    foeS.hp = Math.max(0, foeS.hp - (card.dmg - soak));
    hits[foe] += 1;
  }
  if (card.sh) me.sh += card.sh;
  if (card.heal) me.hp = Math.min(MAX_HP, me.hp + card.heal);
  return { ...s, [who]: me, [foe]: foeS, hits,
    log: `${who === 'me' ? 'You' : 'Rival'} cast ${card.name}!` };
}

/* ---------- wizard avatar (pure Views, styled like CSS) ---------- */
function Wizard({ avatarId, hits, flip }) {
  const shake = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  const avatar = getWizardAvatar(avatarId);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    Animated.sequence([-10, 10, -6, 6, 0].map((v) =>
      Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true }))).start();
  }, [hits]);
  return (
    <Animated.View style={[st.wizard, { transform: [{ translateX: shake }, { scaleX: flip ? -1 : 1 }] }]}>
      <SpriteSheet
        source={avatar.source}
        frameCount={avatar.frameCount}
        scale={1}
      />
    </Animated.View>
  );
}

function Bar({ value, max, color }) {
  return (
    <View style={st.barTrack}>
      <View style={[st.barFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function Stats({ p, label, align }) {
  return (
    <View style={{ alignItems: align, width: '100%' }}>
      <Text style={st.name}>{label}  {p.hp}/{MAX_HP}{p.sh ? `  🛡️${p.sh}` : ''}</Text>
      <Bar value={p.hp} max={MAX_HP} color={C.ember} />
      <Text style={st.mana}>{'◆'.repeat(p.mana)}<Text style={{ opacity: 0.25 }}>{'◇'.repeat(Math.max(0, 6 - p.mana))}</Text></Text>
    </View>
  );
}

/* ---------- spellbook ---------- */
function Book({ s, onPlay, onEnd }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(CARDS.length / PER_PAGE);
  const mine = s.turn === 'me' && s.me.hp > 0 && s.opp.hp > 0;
  return (
    <View style={st.bookWrap}>
      <View style={st.book}>
        <View style={st.bookHead}>
          <Pressable onPress={() => setPage((p) => (p + pages - 1) % pages)} hitSlop={12}><Text style={st.flip}>‹</Text></Pressable>
          <Text style={st.bookTitle}>Spellbook · page {page + 1} of {pages}</Text>
          <Pressable onPress={() => setPage((p) => (p + 1) % pages)} hitSlop={12}><Text style={st.flip}>›</Text></Pressable>
        </View>
        <View style={st.pageRow}>
          {CARDS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((c) => {
            const ok = mine && s.me.mana >= c.cost;
            return (
              <Pressable key={c.id} disabled={!ok} onPress={() => onPlay(c.id)}
                style={({ pressed }) => [st.card, { borderColor: c.color, opacity: ok ? 1 : 0.4 },
                  pressed && { transform: [{ translateY: -8 }] }]}>
                <View style={[st.cost, { backgroundColor: c.color }]}><Text style={st.costTxt}>{c.cost}</Text></View>
                <Text style={st.cardIcon}>{c.icon}</Text>
                <Text style={st.cardName}>{c.name}</Text>
                <Text style={st.cardText}>{c.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ---------- screens ---------- */
function Lobby({ room, setRoom, status, onJoin }) {
  return (
    <View style={st.lobby}>
      <Text style={st.logo}>Wizard Duel</Text>
      <Text style={st.sub}>Two phones, one spellbook each. Choose words to meet.</Text>
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
      <Pressable style={st.btn} onPress={onJoin}><Text style={st.btnTxt}>Enter the duel</Text></Pressable>
      {!!status && <Text style={st.status}>{status}</Text>}
    </View>
  );
}

function Duel({ s, send, dispatch, rematch, leave, opponentAvatarId }) {
  const over = s.me.hp <= 0 || s.opp.hp <= 0;
  const won = s.opp.hp <= 0;
  return (
    <View style={{ flex: 1 }}>
      <View style={st.top}>
        <Stats p={s.opp} label="Rival wizard" align="center" />
        <Wizard avatarId={opponentAvatarId} hits={s.hits.opp} flip />
      </View>
      <View style={st.mid}>
        <Text style={st.log}>{s.log}</Text>
        <Pressable disabled={s.turn !== 'me' || over}
          style={[st.endBtn, (s.turn !== 'me' || over) && { opacity: 0.35 }]}
          onPress={() => { dispatch({ t: 'end', who: 'me' }); send({ type: 'end' }); }}>
          <Text style={st.btnTxt}>{s.turn === 'me' ? 'End turn' : "Rival's turn…"}</Text>
        </Pressable>
      </View>
      <View style={st.mine}>
        <Stats p={s.me} label="You" align="flex-start" />
      </View>
      <Book s={s} onEnd={() => {}} onPlay={(id) => {
        dispatch({ t: 'play', who: 'me', id }); send({ type: 'play', id });
      }} />
      {over && (
        <View style={st.overlay}>
          <Text style={st.logo}>{won ? 'Victory!' : 'Defeated'}</Text>
          <Pressable style={st.btn} onPress={rematch}><Text style={st.btnTxt}>Rematch</Text></Pressable>
          <Pressable style={[st.btn, st.ghost]} onPress={leave}><Text style={st.btnTxt}>Leave</Text></Pressable>
        </View>
      )}
    </View>
  );
}

/* ---------- app / networking ---------- */
export default function App() {
  const [phase, setPhase] = useState('lobby'); // lobby | wait | duel
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState('');
  const [opponentAvatarId, setOpponentAvatarId] = useState(DEFAULT_WIZARD_AVATAR);
  const [s, dispatch] = useReducer(reducer, fresh(true));
  const relay = useRef(null);
  const joining = useRef(false);
  const joinAttempt = useRef(0);

  const send = (move) => {
    relay.current?.send(move).catch((error) => {
      console.error('Unable to send PvP move:', error);
      setStatus(`Unable to send move: ${error.message}`);
    });
  };
  const leave = () => {
    joinAttempt.current += 1;
    joining.current = false;
    const currentRelay = relay.current;
    relay.current = null;
    setPhase('lobby');
    if (currentRelay) {
      currentRelay.leave().catch((error) => {
        console.error('Unable to leave PvP room:', error);
        setStatus(`Unable to leave room: ${error.message}`);
      });
    }
  };

  const join = async () => {
    if (joining.current) return;
    if (!room.trim()) {
      setStatus('Enter the words your rival will use to join.');
      return;
    }

    joining.current = true;
    const attempt = ++joinAttempt.current;
    setStatus('Connecting to Firebase…');
    setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
    setPhase('wait');

    try {
      const currentRelay = await connectToRoom(room, {
        avatarId: DEFAULT_WIZARD_AVATAR,
        onOpponentAvatar: setOpponentAvatarId,
        onStart: ({ first, avatarId }) => {
          setOpponentAvatarId(getWizardAvatarId(avatarId));
          dispatch({ t: 'reset', first });
          setStatus('');
          setPhase('duel');
        },
        onWait: ({ reconnecting }) => {
          setPhase('wait');
          setStatus(reconnecting ? 'Your rival left. Waiting for another wizard…' : 'Your rival left the duel.');
        },
        onMove: (move) => {
          if (move.type === 'play') dispatch({ t: 'play', who: 'opp', id: move.id });
          else if (move.type === 'end') dispatch({ t: 'end', who: 'opp' });
          else if (move.type === 'rematch') dispatch({ t: 'reset', first: true });
        },
        onError: (error) => {
          console.error('Firebase PvP relay error:', error);
          setStatus(`Firebase connection failed: ${error.message}`);
          setPhase('lobby');
          const currentRelay = relay.current;
          relay.current = null;
          currentRelay?.leave().catch((leaveError) => {
            console.error('Unable to leave failed PvP room:', leaveError);
          });
        },
      });
      if (attempt !== joinAttempt.current) {
        await currentRelay.leave();
        return;
      }
      relay.current = currentRelay;
      setStatus('');
    } catch (error) {
      if (attempt !== joinAttempt.current) return;
      console.error('Unable to join PvP room:', error);
      setPhase('lobby');
      setStatus(error.code === 'ROOM_FULL'
        ? 'That room already has two wizards.'
        : `Unable to join room: ${error.message}`);
    } finally {
      if (attempt === joinAttempt.current) joining.current = false;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={st.root}>
        {phase === 'lobby' && <Lobby {...{ room, setRoom, status, onJoin: join }} />}
        {phase === 'wait' && (
          <View style={st.lobby}>
            <Text style={st.logo}>Waiting…</Text>
            <Text style={st.sub}>Waiting for someone who entered the same room words.</Text>
            {!!status && <Text style={st.status}>{status}</Text>}
            <Pressable style={[st.btn, st.ghost]} onPress={leave}><Text style={st.btnTxt}>Cancel</Text></Pressable>
          </View>
        )}
        {phase === 'duel' && (
          <Duel s={s} send={send} dispatch={dispatch} leave={leave}
            opponentAvatarId={opponentAvatarId}
            rematch={() => { dispatch({ t: 'reset', first: false }); send({ type: 'rematch' }); }} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ---------- styles (the "CSS") ---------- */
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  lobby: { flex: 1, padding: 28, justifyContent: 'center', gap: 8 },
  logo: { color: C.gold, fontSize: 40, fontWeight: '800', fontFamily: 'serif', textAlign: 'center' },
  sub: { color: '#b9b0dd', textAlign: 'center', marginBottom: 16, fontSize: 16 },
  label: { color: '#b9b0dd', marginTop: 8 },
  input: { backgroundColor: C.dusk, color: '#fff', borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#4b3b94' },
  btn: { backgroundColor: C.gold, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  ghost: { backgroundColor: '#4b3b94' },
  btnTxt: { color: C.ink, fontWeight: '800', fontSize: 16 },
  status: { color: '#ff9b86', textAlign: 'center', marginTop: 12 },

  top: { flex: 4, alignItems: 'center', paddingTop: 10, paddingHorizontal: 40, backgroundColor: C.dusk },
  mid: { alignItems: 'center', paddingVertical: 8, backgroundColor: C.night, gap: 6 },
  log: { color: C.teal, fontSize: 15, fontWeight: '600' },
  endBtn: { backgroundColor: C.gold, paddingVertical: 8, paddingHorizontal: 22, borderRadius: 20 },
  mine: { paddingHorizontal: 20, paddingBottom: 6 },
  name: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  mana: { color: C.teal, letterSpacing: 3, marginTop: 4, fontSize: 14 },
  barTrack: { height: 10, width: '100%', backgroundColor: '#0c0920', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%' },

  wizard: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', marginTop: 10 },

  bookWrap: { flex: 5, paddingHorizontal: 8, paddingBottom: 6, justifyContent: 'flex-end' },
  book: { backgroundColor: C.leather, borderRadius: 16, padding: 10, borderWidth: 3, borderColor: C.leatherLo,
    transform: [{ perspective: 700 }, { rotateX: '14deg' }], elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  bookHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 6 },
  bookTitle: { color: C.gold, fontFamily: 'serif', fontWeight: '700' },
  flip: { color: C.gold, fontSize: 30, paddingHorizontal: 10 },
  pageRow: { flexDirection: 'row', gap: 8, backgroundColor: C.page, borderRadius: 8, padding: 8, justifyContent: 'center' },
  card: { flex: 1, minHeight: 150, backgroundColor: '#fff8e6', borderRadius: 10, borderWidth: 3, padding: 6, alignItems: 'center' },
  cost: { position: 'absolute', top: -8, left: -8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  costTxt: { fontWeight: '800', color: C.ink },
  cardIcon: { fontSize: 38, marginTop: 14 },
  cardName: { color: C.ink, fontWeight: '800', marginTop: 6, textAlign: 'center', fontSize: 13 },
  cardText: { color: '#5b4a35', fontSize: 11, marginTop: 4, textAlign: 'center' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,6,30,0.88)', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
