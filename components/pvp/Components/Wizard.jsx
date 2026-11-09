
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";

import { HitShake } from "../Animation/HitShake";
import SpriteSheet from "../../shared/SpriteSheet";
import { getWizardAvatar } from "../../../constants/wizardAvatars";

export function Wizard({ avatarId, hits, flip, effect }) {
  const avatar = getWizardAvatar(avatarId);

  const [activeEffect, setActiveEffect] = useState(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const previousHits = useRef(hits);
  const pendingShake = useRef(false);
  const effectActive = useRef(false);

  // Detect incoming damage
  useEffect(() => {
    if (hits > previousHits.current) {
      previousHits.current = hits;

      if (effectActive.current) {
        // Wait for the spell animation to finish
        pendingShake.current = true;
      } else {
        // No active spell effect, shake immediately
        setShakeTrigger((value) => value + 1);
      }
    } else {
      previousHits.current = hits;
    }
  }, [hits]);

  // Start spell effect
  useEffect(() => {
    if (effect?.key == null) return;

    effectActive.current = true;
    setActiveEffect(effect);
  }, [effect?.key]);

  // Run shake after spell effect finishes
  const handleEffectComplete = () => {
    effectActive.current = false;
    setActiveEffect(null);

    if (pendingShake.current) {
      pendingShake.current = false;
      setShakeTrigger((value) => value + 1);
    }
  };

  return (
    <View style={styles.wizard}>
      <HitShake hits={shakeTrigger} style={styles.shakeArea}>
        <View style={styles.container}>
          <View
            style={[
              styles.sprite,
              { transform: [{ scaleX: flip ? -1 : 1 }] },
            ]}
          >
            <SpriteSheet
              source={avatar.source}
              frameCount={avatar.frameCount}
              scale={1}
            />
          </View>
        </View>
      </HitShake>

      {activeEffect && (
        <View
          pointerEvents="none"
          style={styles.effectOverlay}
        >
          <SpriteSheet
            key={activeEffect.key}
            source={activeEffect.source}
            frameCount={activeEffect.frameCount}
            frameWidth={activeEffect.frameWidth}
            frameHeight={activeEffect.frameHeight}
            fps={activeEffect.fps}
            loop={false}
            scale={activeEffect.scale || 1.5}
            onComplete={handleEffectComplete}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wizard: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    overflow: "visible",
    position: "relative",
  },

  shakeArea: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  sprite: {
    alignItems: "center",
    justifyContent: "center",
  },

  effectOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    overflow: "visible",
  },
});
