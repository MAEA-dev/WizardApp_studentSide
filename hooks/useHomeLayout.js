import { useWindowDimensions } from "react-native";

export const useHomeLayout = () => {
  const { width, height } = useWindowDimensions();

  const isSmall = height < 720;
  const isVerySmall = height < 650;
  const isNarrow = width < 380;

  return {
    width,
    height,
    isSmall,
    isVerySmall,
    isNarrow,

    avatarSize: isVerySmall ? 46 : isSmall ? 52 : 58,
    wizardScale: isVerySmall ? 1 : isSmall ? 1 : 1.2,
    statHeight: isVerySmall ? 42 : isSmall ? 46 : 50,

    screenPadding: isVerySmall ? 7 : isSmall ? 9 : 11,
    screenBottomPadding: isSmall ? 5 : 10,

    cardPadding: isVerySmall ? 8 : 10,
    smallGap: isVerySmall ? 5 : 7,
    normalGap: isVerySmall ? 7 : 9,
  };
};