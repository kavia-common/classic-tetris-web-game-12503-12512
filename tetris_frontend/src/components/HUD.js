import React from "react";
import styles from "./HUD.module.css";

// PUBLIC_INTERFACE
function HUD({ score, lines, level, paused, gameOver }) {
  return (
    <div className={styles.hud}>
      <div>
        <span className={styles.label}>Score</span>
        <span className={styles.value}>{score}</span>
      </div>
      <div>
        <span className={styles.label}>Level</span>
        <span className={styles.value}>{level}</span>
      </div>
      <div>
        <span className={styles.label}>Lines</span>
        <span className={styles.value}>{lines}</span>
      </div>
      {paused && !gameOver ? (
        <div className={styles.statusPaused}>Paused</div>
      ) : null}
      {gameOver && (
        <div className={styles.statusGameOver}>Game Over</div>
      )}
    </div>
  );
}
export default HUD;
