import React from "react";

import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SpriteAnimator from "./SpriteAnimator";
import SkillEffect from "./skillEffect";
import {Fonts} from "../../constants/Fonts"
import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatar,
} from "../../constants/wizardAvatars";

import {
  monsterSprites,
} from "../../data/battleSprites";

const BATTLE_BACKGROUND = require("../../assets/images/dungeonBg.png");

const BattleStage = ({
  wizardHp,
  monsterHp,
  wizardHpPercent,
  monsterHpPercent,
  wizardAvatarId = DEFAULT_WIZARD_AVATAR,
  monsterAnimations,
  monsterFlipped = false,
  monsterScale,
  monsterHeightScale = 1,

  wizardAction,
  monsterAction,
  setWizardAction,
  setMonsterAction,

  skillEffect,
  skillEffectTarget,
  onSkillEffectFinish,
}) => {
  const equippedAvatar = getWizardAvatar(wizardAvatarId);
  const wizardAnimations = Object.fromEntries(
    Object.entries(equippedAvatar.animations).map(([action, animation]) => [
      action,
      {
        ...animation,
        frameWidth: 128,
        frameHeight: 128,
        loop: action === "idle",
      },
    ])
  );
  const displayedWizardAction =
    wizardAction === "die"
      ? "defeat"
      : wizardAnimations[wizardAction]
        ? wizardAction
        : "idle";
  const displayedMonsterAnimations = {
    ...monsterSprites,
    ...Object.fromEntries(
      Object.entries(monsterAnimations || {}).filter(
        ([, animation]) => animation?.source
      )
    ),
  };
  const hasCustomMonsterAnimations = Object.values(
    monsterAnimations || {}
  ).some((animation) => animation?.source);

  return (
    <ImageBackground
      source={BATTLE_BACKGROUND}
      resizeMode="cover"
      style={styles.stage}
      imageStyle={styles.stageImage}
    >
      <View style={styles.stageOverlay}>
        <View style={styles.header}>
          <View style={styles.fighterStatus}>
            <Text style={[styles.hpText, {color: "#0ff439"}]}>{wizardHp} HP</Text>

            <View style={styles.hpBarOuter}>
              <View
                style={[
                  styles.hpBarInner,
                  styles.wizardHpBar,
                  {
                    width: `${wizardHpPercent}%`,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.fighterStatus}>
            <Text style={[styles.hpText, styles.rightText, {color: "#ff1c1c"}]}>
              {monsterHp} HP
            </Text>

            <View style={styles.hpBarOuter}>
              <View
                style={[
                  styles.hpBarInner,
                  styles.monsterHpBar,
                  {
                    width: `${monsterHpPercent}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.battleField}>
          <View style={styles.characterBox}>
            <SpriteAnimator
              animations={wizardAnimations}
              action={displayedWizardAction}
              width={128}
              height={128}
              scale={0.9}
              fps={7}
              onAnimationFinish={(finishedAction) => {
                if (finishedAction !== "defeat") {
                  setWizardAction("idle");
                }
              }}
            />
            {skillEffect && skillEffectTarget === "left" && (
              <SkillEffect
                visible
                effect={skillEffect}
                scale={1.2}
                onFinish={onSkillEffectFinish}
              />
            )}
          </View>

          <View style={styles.characterBox}>
            <SpriteAnimator
              animations={displayedMonsterAnimations}
              action={monsterAction}
              width={96}
              height={96}
              scale={monsterScale ?? (hasCustomMonsterAnimations ? 0.9 : 1.2)}
              heightScale={monsterHeightScale}
              flipped={monsterFlipped}
              fps={7}
              onAnimationFinish={(finishedAction) => {
                if (finishedAction !== "die") {
                  setMonsterAction("idle");
                }
              }}
            />
            {skillEffect && skillEffectTarget === "right" && (
              <SkillEffect
                visible
                effect={skillEffect}
                scale={1.2}
                onFinish={onSkillEffectFinish}
              />
            )}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default BattleStage;

const styles = StyleSheet.create({
  stage: {
    height: 248,
    borderTopWidth: 2,
    borderColor: "#8B5CF6",
    overflow: "hidden",
    backgroundColor: "#18002F",
  },

  stageImage: {
    opacity: 1,
  },

  stageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  header: {
    minHeight: 58,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  fighterStatus: {
    flex: 1,
  },

  hpText: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: "#ffffff",
    marginTop: 2,
  },

  rightText: {
    textAlign: "right",
  },

  hpBarOuter: {
    width: "100%",
    height: 8,
    backgroundColor: "#44305F",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 5,
  },

  hpBarInner: {
    height: "100%",
    borderRadius: 999,
  },

  wizardHpBar: {
    backgroundColor: "#36D399",
  },

  monsterHpBar: {
    backgroundColor: "#F43F5E",
  },

  vsText: {
    fontFamily: Fonts.pixel,
    width: 42,
    textAlign: "center",
    fontSize: 13,
   
    color: "#FFD84D",
  },

  battleField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 14,
  },

  characterBox: {
    position: "relative",
    width: 125,
    height: 125,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
});
