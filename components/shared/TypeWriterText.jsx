import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

export default function TypewriterText({
  text = "",
  speed = 500,
  style,
  onDone,
}) {
  const [displayedText, setDisplayedText] = useState("");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayedText("");

    if (!text) return;

    let index = 0;

    const interval = setInterval(() => {
      index += 1;

      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
        onDoneRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={style}>{displayedText}</Text>;
}