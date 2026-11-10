
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";

import { HitShake } from "../Animation/HitShake";
import SpriteSheet from "../../shared/SpriteSheet";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAnimation,
} from "../../../constants/wizardAvatars";

export function Wizard({
  avatarId = DEFAULT_WIZARD_AVATAR,
  hits,
  flip,
  effect,
  animation = "idle",
  animationKey = 0,
  onAnimationComplete,
  onEffectComplete,
}) {
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [activeEffect, setActiveEffect] = useState(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const previousHits = useRef(hits);
  const pendingShake = useRef(false);
  const effectActive = useRef(false);
  const nonDamageEffect = useRef(false);

  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onEffectCompleteRef = useRef(onEffectComplete);

  const selectedAnimation = getWizardAnimation(
    avatarId,
    currentAnimation
  );

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onEffectCompleteRef.current = onEffectComplete;
  }, [onEffectComplete]);

  useEffect(() => {
    if (!animationKey || animation !== "attack") return;
    setCurrentAnimation("attack");
  }, [animationKey, animation]);

  useEffect(() => {
    if (!effect || effect.key == null) return;

    effectActive.current = true;

    nonDamageEffect.current = [
      "heal",
      "shield",
      "ward",
    ].includes(effect.cardId);

    pendingShake.current = false;

    setActiveEffect(effect);
  }, [effect?.key]);

  useEffect(() => {
    if (hits > previousHits.current) {
      previousHits.current = hits;

      if (nonDamageEffect.current) return;

      if (effectActive.current) {
        pendingShake.current = true;
      } else if (currentAnimation !== "attack") {
        setShakeTrigger((value) => value + 1);
      }
    } else {
      previousHits.current = hits;
    }
  }, [hits, currentAnimation]);

  const handleAnimationComplete = () => {
    setCurrentAnimation("idle");
    onAnimationCompleteRef.current?.();
  };

  const handleShakeComplete = () => {};

  const handleEffectComplete = () => {
    effectActive.current = false;
    nonDamageEffect.current = false;
    setActiveEffect(null);

    if (pendingShake.current) {
      pendingShake.current = false;
      setShakeTrigger((value) => value + 1);
    }

    onEffectCompleteRef.current?.();
  };

  return (
    <View style={styles.wizard}>
      <HitShake
        hits={shakeTrigger}
        style={styles.shakeArea}
        onComplete={handleShakeComplete}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.sprite,
              {
                transform: [
                  { scaleX: flip ? -1 : 1 },
                ],
              },
            ]}
          >
            <SpriteSheet
              key={`${avatarId}-${currentAnimation}-${animationKey}`}
              source={selectedAnimation.source}
              frameCount={selectedAnimation.frameCount}
              fps={
                selectedAnimation.fps ||
                (currentAnimation === "attack" ? 20 : 8)
              }
              scale={1}
              loop={currentAnimation === "idle"}
              onComplete={
                currentAnimation === "attack"
                  ? handleAnimationComplete
                  : undefined
              }
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
