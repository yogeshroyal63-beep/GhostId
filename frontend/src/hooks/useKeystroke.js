import { useState, useEffect, useRef, useCallback } from "react";
import { extractFeatures as _extractFeatures, FEATURE_SIZE } from "@sdk/features.js";

const MIN_KEYSTROKES = 10;

export function useKeystroke() {
  const [count, setCount] = useState(0);
  const [recentKeys, setRecentKeys] = useState([]);
  const eventsRef = useRef([]);
  const downsRef = useRef({});
  const pasteDetectedRef = useRef(false);

  useEffect(() => {
    const onDown = (e) => {
      if (e.repeat) return;
      downsRef.current[e.key] = performance.now();
      eventsRef.current.push({ key: e.key, type: "down", t: performance.now() });
    };

    const onUp = (e) => {
      eventsRef.current.push({ key: e.key, type: "up", t: performance.now() });
      setCount((c) => c + 1);
      setRecentKeys((prev) =>
        [e.key === " " ? "·" : e.key, ...prev].slice(0, 14)
      );
    };

    const onPaste = () => { pasteDetectedRef.current = true; };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  const extractFeatures = useCallback(() => {
    return _extractFeatures(eventsRef.current);
  }, []);

  const clear = useCallback(() => {
    eventsRef.current = [];
    downsRef.current = {};
    setCount(0);
    setRecentKeys([]);
  }, []);

  return {
    count,
    recentKeys,
    extractFeatures,
    clear,
    ready: count >= MIN_KEYSTROKES,
    minKeystrokes: MIN_KEYSTROKES,
    pasteDetectedRef,
  };
}