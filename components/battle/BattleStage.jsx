import React from "react";

import {
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import SpriteAnimator from "./SpriteAnimator";
import SkillEffect from "./skillEffect";
import {Fonts} from "../../constants/Fonts"

import {
  wizardSprites,
  monsterSprites,
} from "../../data/battleSprites";

const BATTLE_BACKGROUND = require("../../assets/images/dungeonBg.png");

const BattleStage = ({
  wizardHp,
  monsterHp,
  wizardHpPercent,
  monsterHpPercent,

  wizardAction,
  monsterAction,
  setWizardAction,
  setMonsterAction,

  skillEffect,
  skillEffectTarget,
  onSkillEffectFinish,
}) => {
  const { width } = useWindowDimensions();

  const fieldWidth = width;
  const fieldHeight = 190;

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
              animations={wizardSprites}
              action={wizardAction}
              width={128}
              height={128}
              scale={0.9}
              fps={7}
              onAnimationFinish={(finishedAction) => {
                if (finishedAction !== "die") {
                  setWizardAction("idle");
                }
              }}
            />
          </View>

          <SkillEffect
            visible={!!skillEffect}
            effect={skillEffect}
            position={skillEffectTarget}
            fieldWidth={fieldWidth}
            fieldHeight={fieldHeight}
            scale={1.2}
            onFinish={onSkillEffectFinish}
          />

          <View style={styles.characterBox}>
            <SpriteAnimator
              animations={monsterSprites}
              action={monsterAction}
              width={96}
              height={96}
              scale={1.2}
              fps={7}
              onAnimationFinish={(finishedAction) => {
                if (finishedAction !== "die") {
                  setMonsterAction("idle");
                }
              }}
            />
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
    paddingHorizontal: 25,
    paddingBottom: 14,
  },

  characterBox: {
    width: 125,
    height: 125,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
});