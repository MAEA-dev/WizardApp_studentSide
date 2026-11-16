import {
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { st } from "../PvpStyles";

export function Lobby({ room, setRoom, status, onJoin }) {
  return (
    <ImageBackground
      source={require("../../../assets/images/battleBg.png")}
      resizeMode="cover"
      style={st.lobbyBackground}
      imageStyle={st.lobbyBackgroundImage}
    >
      <View style={[st.lobby, st.lobbyBackdrop]}>
        <Text style={st.lobbyLogo}>Wizard Duel</Text>

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
    </ImageBackground>
  );
}
