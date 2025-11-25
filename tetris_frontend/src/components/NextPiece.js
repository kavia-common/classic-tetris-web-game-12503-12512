import React from "react";
import styles from "./NextPiece.module.css";
import { TETROMINOES } from "../game/logic";

// PUBLIC_INTERFACE
function NextPiece({ tetromino }) {
  // Show small grid of upcoming piece
  if (!tetromino) return null;
  const color = TETROMINOES[tetromino].color;
  const shape = TETROMINOES[tetromino][0];
  // Draw 4x4 grid centered
  let grid = Array(4).fill(null).map(() => Array(4).fill(null));
  shape.forEach(([dx, dy]) => {
    let x = dx + 1, y = dy + 1; // center
    if (y >= 0 && y < 4 && x >= 0 && x < 4) grid[y][x] = true;
  });
  return (
    <div className={styles.nextPieceWrap}>
      <div className={styles.label}>Next</div>
      <div className={styles.nextGrid}>
        {grid.map((row, y) =>
          <div className={styles.row} key={y}>
            {row.map((cell, x) =>
              <div
                key={x}
                className={styles.cell}
                style={{ background: cell ? color : "transparent" }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default NextPiece;
