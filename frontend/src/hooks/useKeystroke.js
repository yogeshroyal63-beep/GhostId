import { useState, useEffect, useRef, useCallback } from "react";

const MIN_KEYSTROKES = 10;
const FEATURE_SIZE = 41;

export function useKeystroke() {
  const [count, setCount] = useState(0);
  const [recentKeys, setRecentKeys] = useState([]);
  const eventsRef = useRef([]);
  const downsRef = useRef({});

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

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const extractFeatures = useCallback(() => {
    const downs = {};
    const dwells = [];

    for (const ev of eventsRef.current) {
      if (ev.type === "down") downs[ev.key] = ev.t;
      if (ev.type === "up" && downs[ev.key] !== undefined) {
        dwells.push((ev.t - downs[ev.key]) / 1000);
        delete downs[ev.key];
      }
    }

    const ratios = [];
    for (let i = 0; i < dwells.length - 1; i++) {
      let ratio = dwells[i] / (dwells[i + 1] + 1e-8);
      ratio = Math.min(ratio, 10);
      ratios.push(ratio);
    }

    const combined = [...dwells, ...ratios];
    while (combined.length < FEATURE_SIZE) combined.push(0);
    return combined.slice(0, FEATURE_SIZE);
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
  };
}
