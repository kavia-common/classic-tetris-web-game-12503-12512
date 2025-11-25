import React from "react";
import styles from "./Board.module.css";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "../game/logic";

// PUBLIC_INTERFACE
function Board({ board, tetromino, ghostY, justCleared, gameOver }) {
  // Place tetromino cells temporarily over the grid (for display only)
  const displayBoard = board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  if (tetromino && !gameOver) {
    const { type, pos, rotation } = tetromino;
    const shape = TETROMINOES[type][rotation];
    shape.forEach(([dx, dy]) => {
      const x = pos.x + dx, y = pos.y + dy;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        displayBoard[y][x] = { ...displayBoard[y][x], _active: true, type };
      }
    });
    // Ghost piece
    if (ghostY > pos.y) {
      shape.forEach(([dx, dy]) => {
        const x = pos.x + dx, y = ghostY + dy;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !displayBoard[y][x]) {
          displayBoard[y][x] = { color: TETROMINOES[type].ghost, _ghost: true, type };
        }
      });
    }
  }
  return (
    <div
      className={`${styles.board} ${gameOver ? styles.gameover : ""}`}
      tabIndex={0}
    >
      {displayBoard.map((row, y) =>
        <div key={y} className={styles.row}>
          {row.map((cell, x) => {
            let cellClass = styles.cell;
            let cellStyle = {};
            let c = cell;
            if (justCleared.includes(y)) cellClass += ` ${styles.clearing}`;
            if (c?._ghost) cellClass += ` ${styles.ghost}`;
            else if (c?._active) cellClass += ` ${styles.active}`;
            if (c?.color) cellStyle.background = c.color;
            if (c?._ghost) cellStyle.opacity = 0.28;
            return <div key={x} className={cellClass} style={cellStyle}></div>;
          })}
        </div>
      )}
    </div>
  );
}

export default Board;
