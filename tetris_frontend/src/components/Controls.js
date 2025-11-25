import React from "react";
import styles from "./Controls.module.css";

// PUBLIC_INTERFACE
function Controls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onDrop,
  onPause,
}) {
  return (
    <div className={styles.controls} aria-label="Tetris controls">
      <button className={styles.btn} onClick={onMoveLeft} title="Left">&#8592;</button>
      <button className={styles.btn} onClick={onMoveRight} title="Right">&#8594;</button>
      <button className={styles.btn} onClick={onMoveDown} title="Down">&#8595;</button>
      <button className={styles.btn} onClick={onRotate} title="Rotate">&#8635;</button>
      <button className={styles.btn} onClick={onDrop} title="Hard Drop">⮉</button>
      <button className={styles.btnSecondary} onClick={onPause} title="Pause/Resume">Pause</button>
    </div>
  );
}
export default Controls;
