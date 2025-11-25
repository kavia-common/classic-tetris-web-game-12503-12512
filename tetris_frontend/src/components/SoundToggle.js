import React from "react";
import styles from "./SoundToggle.module.css";

// PUBLIC_INTERFACE
function SoundToggle({ muted, onToggle }) {
  return (
    <button
      className={styles.soundToggle}
      onClick={onToggle}
      aria-label={muted ? "Unmute game" : "Mute game"}
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
export default SoundToggle;
