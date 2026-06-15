import { useState } from "react";
import Nav from "./components/Nav";
import HardStopOverlay from "./components/HardStopOverlay";
import HeroSection from "./components/sections/HeroSection";
import DemoSection from "./components/sections/DemoSection";
import SDKSection from "./components/sections/SDKSection";
import HowItWorks from "./components/sections/HowItWorks";
import APISection from "./components/sections/APISection";

export default function App() {
  const [hardStop, setHardStop] = useState(false);

  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <DemoSection onHardStop={() => setHardStop(true)} />
        <SDKSection />
        <HowItWorks />
        <APISection />
      </main>
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 1rem",
          color: "var(--muted)",
          fontSize: "0.85rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        GhostID v3 · Built by Yogesh Rayal 
      </footer>
      <HardStopOverlay visible={hardStop} onDismiss={() => setHardStop(false)} />
    </>
  );
}
