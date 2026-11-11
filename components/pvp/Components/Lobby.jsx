import { Pressable, Text, TextInput, View } from "react-native";
import { st } from "../PvpStyles";

export function Lobby({ room, setRoom, status, onJoin, energyStatus, countdown }) {
  const canEnter = Number(energyStatus?.energy) >= 1;
  return (
    <View style={st.lobby}>
      <Text style={st.logo}>Wizard Duel</Text>

      <Text style={st.sub}>
        Two phones, one spellbook each. Choose words to meet.
      </Text>

      <Text style={st.energyStatus}>
        Energy: {energyStatus ? `${energyStatus.energy}/${energyStatus.maxEnergy}` : "Loading..."}
      </Text>
      <Text style={st.energyCountdown}>
        {!energyStatus
          ? "Checking regeneration..."
          : energyStatus.energy >= energyStatus.maxEnergy
            ? "Energy is FULL"
            : `Next Energy: ${countdown || "00:00"}`}
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

      <Pressable
        style={[st.btn, !canEnter && st.btnDisabled]}
        onPress={onJoin}
        disabled={!canEnter}
      >
        <Text style={st.btnTxt}>
          {energyStatus && energyStatus.energy < 1 ? "Wait for Energy" : "Enter the duel"}
        </Text>
      </Pressable>

      {energyStatus?.energy < 1 && (
        <Text style={st.energyCountdown}>
          You need at least 1 Energy. It will regenerate automatically.
        </Text>
      )}

      {!!status && <Text style={st.status}>{status}</Text>}
    </View>
  );
}
