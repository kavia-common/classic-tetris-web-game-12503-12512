import React, { useRef, useState, useEffect, useCallback } from "react";
import Board from "./Board";
import NextPiece from "./NextPiece";
import HUD from "./HUD";
import Controls from "./Controls";
import SoundToggle from "./SoundToggle";
import {
  TETROMINOES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  randomBag,
  rotate,
  checkCollision,
  emptyBoard
} from "../game/logic";
import styles from "./TetrisGame.module.css";

// Gravity speeds: indices = level, values = ms per tick (faster each level, up to level 20)
const LEVEL_SPEED = [
  800, 720, 630, 550, 470,
  380, 300, 220, 130, 100,
  80, 80, 80, 70, 70,
  50, 50, 30, 30, 20, 20
];
const POINTS_PER_LINE = [0, 100, 300, 500, 800];

// PUBLIC_INTERFACE
function TetrisGame() {
  // State
  const [board, setBoard] = useState(emptyBoard());
  const [tetromino, setTetromino] = useState(null); // { type, pos: {x,y}, rotation }
  const [nextTetromino, setNextTetromino] = useState(null);
  const [bag, setBag] = useState(randomBag());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mute, setMute] = useState(false);
  const [justCleared, setJustCleared] = useState([]); // Animation
  const requestRef = useRef();
  const [dropTime, setDropTime] = useState(LEVEL_SPEED[0]);
  const inputStack = useRef([]);
  const [blinkPause, setBlinkPause] = useState(false);

  // Initialize game
  useEffect(() => {
    startGame();
    // eslint-disable-next-line
  }, []);

  // Handle level up speed
  useEffect(() => {
    setDropTime(LEVEL_SPEED[Math.min(level, LEVEL_SPEED.length - 1)]);
  }, [level]);

  // Game loop (gravity)
  useEffect(() => {
    if (paused || gameOver) return;
    if (!tetromino) return;
    const gravity = setTimeout(() => {
      moveDown();
    }, dropTime);
    return () => clearTimeout(gravity);
    // eslint-disable-next-line
  }, [tetromino, board, dropTime, paused, gameOver]);

  // Keyboard events
  useEffect(() => {
    const onKeyDown = e => {
      if (gameOver) return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space", "KeyP"].includes(e.code)) {
        e.preventDefault();
        inputStack.current.push(e.code);
        handleInput(e.code);
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line
  }, [tetromino, paused, gameOver, mute, board, level]);

  // Blink "Paused"
  useEffect(() => {
    if (!paused || gameOver) {
      setBlinkPause(false);
      return;
    }
    const intv = setInterval(() => setBlinkPause(v => !v), 380);
    return () => clearInterval(intv);
  }, [paused, gameOver]);

  // PUBLIC_INTERFACE
  function startGame() {
    setBoard(emptyBoard());
    const bag1 = randomBag();
    const t1 = { type: bag1[0], pos: { x: 3, y: 0 }, rotation: 0 };
    setTetromino(t1);
    setNextTetromino({ type: bag1[1], pos: { x: 3, y: 0 }, rotation: 0 });
    setBag(bag1.slice(2));
    setScore(0);
    setLevel(0);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setJustCleared([]);
  }

  // PUBLIC_INTERFACE
  function handleInput(code) {
    if (paused && code !== "KeyP") return;
    if (code === "KeyP") {
      setPaused(p => !p);
      return;
    } else if (gameOver) {
      startGame();
      return;
    }
    if (!tetromino) return;
    switch (code) {
      case "ArrowLeft":
        move(-1, 0, 0);
        break;
      case "ArrowRight":
        move(1, 0, 0);
        break;
      case "ArrowDown":
        move(0, 1, 0);
        break;
      case "ArrowUp":
        move(0, 0, 1);
        break;
      case "Space":
        hardDrop();
        break;
      default: break;
    }
  }

  // PUBLIC_INTERFACE
  function move(dx, dy, drot) {
    if (!tetromino) return;
    let newTet = { ...tetromino, pos: { ...tetromino.pos }, rotation: tetromino.rotation };
    if (dx !== 0) newTet.pos.x += dx;
    if (dy !== 0) newTet.pos.y += dy;
    if (drot !== 0) newTet.rotation = (tetromino.rotation + drot) % 4;
    if (!checkCollision(board, newTet)) {
      setTetromino(newTet);
    } else if (dy !== 0) {
      // Landed
      lockPiece();
    }
    // Play move/rotate audio placeholder if !mute
  }

  // PUBLIC_INTERFACE
  function moveDown() {
    if (!tetromino) return;
    const moved = { ...tetromino, pos: { ...tetromino.pos, y: tetromino.pos.y + 1 } };
    if (!checkCollision(board, moved)) {
      setTetromino(moved);
    } else {
      lockPiece();
    }
  }

  // PUBLIC_INTERFACE
  function hardDrop() {
    if (!tetromino) return;
    let test = { ...tetromino };
    let dropY = tetromino.pos.y;
    while (!checkCollision(board, { ...test, pos: { ...test.pos, y: dropY + 1 } })) {
      dropY += 1;
    }
    test.pos.y = dropY;
    setTetromino(test);
    lockPiece(test, true);
  }

  // Place piece onto board, check for lines, handle next
  function lockPiece(forceTetromino, force) {
    if (!tetromino) return;
    const t = forceTetromino || tetromino;
    let newBoard = board.map(row => [...row]);
    const shape = TETROMINOES[t.type][t.rotation];
    shape.forEach(([dx, dy]) => {
      const x = t.pos.x + dx, y = t.pos.y + dy;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newBoard[y][x] = { color: TETROMINOES[t.type].color, type: t.type };
      }
    });
    // Check for lines
    let linesCleared = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (newBoard[y].every(cell => !!cell)) linesCleared.push(y);
    }
    if (linesCleared.length > 0) {
      setJustCleared([...linesCleared]);
      setTimeout(() => {
        setJustCleared([]);
        // Actually clear the lines and drop above
        let clearedBoard = newBoard.filter((row, yidx) => !linesCleared.includes(yidx));
        for (let i = 0; i < linesCleared.length; i++) {
          clearedBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }
        setBoard(clearedBoard);
        setLines(l => l + linesCleared.length);
        setScore(s => s + POINTS_PER_LINE[linesCleared.length] * (level + 1));
        setLevel(lvl => Math.floor((lines + linesCleared.length) / 10));
        spawnTetromino();
        // Placeholder: play clear line audio if !mute
      }, 180);
    } else {
      setBoard(newBoard);
      spawnTetromino();
    }
  }

  // Spawn new piece, check game over
  function spawnTetromino() {
    let drawBag = bag.slice();
    let type = nextTetromino ? nextTetromino.type : drawBag.shift();
    if (drawBag.length < 5) drawBag = [...drawBag, ...randomBag()];
    const piece = {
      type,
      pos: { x: 3, y: 0 },
      rotation: 0,
    };
    if (checkCollision(board, piece)) {
      setGameOver(true);
      // Placeholder: play game over audio if !mute
      return;
    }
    setTetromino(piece);
    setNextTetromino({ type: drawBag[0], pos: { x: 3, y: 0 }, rotation: 0 });
    setBag(drawBag.slice(1));
  }

  // Move/rotate via buttons/touch
  const onMoveLeft = useCallback(() => handleInput("ArrowLeft"), []);
  const onMoveRight = useCallback(() => handleInput("ArrowRight"), []);
  const onMoveDown = useCallback(() => handleInput("ArrowDown"), []);
  const onRotate = useCallback(() => handleInput("ArrowUp"), []);
  const onDrop = useCallback(() => handleInput("Space"), []);
  const onPause = useCallback(() => handleInput("KeyP"), []);
  const onMuteToggle = useCallback(() => setMute(m => !m), []);

  // Blink appear/hide "Paused"
  // . . .

  // Board with ghost piece
  let ghostY = tetromino ? tetromino.pos.y : 0;
  if (tetromino) {
    let test = { ...tetromino };
    while (!checkCollision(board, { ...test, pos: { ...test.pos, y: ghostY + 1 } })) {
      ghostY += 1;
    }
  }

  return (
    <div className={styles.tetrisRoot}>
      <div className={styles.headerBar}>
        <span className={styles.logo}>TETRIS</span>
        <span className={styles.subtitle}>Ocean Professional</span>
        <SoundToggle muted={mute} onToggle={onMuteToggle} />
      </div>
      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <HUD
            score={score}
            lines={lines}
            level={level}
            paused={paused}
            gameOver={gameOver}
          />
          <NextPiece tetromino={nextTetromino?.type} />
          <Controls
            onMoveLeft={onMoveLeft}
            onMoveRight={onMoveRight}
            onMoveDown={onMoveDown}
            onRotate={onRotate}
            onDrop={onDrop}
            onPause={onPause}
          />
        </div>
        <Board
          board={board}
          tetromino={tetromino}
          ghostY={ghostY}
          justCleared={justCleared}
          gameOver={gameOver}
        />
      </div>
      {paused && !gameOver && (
        <div className={styles.pausedOverlay}>
          {blinkPause ? "PAUSED" : ""}
        </div>
      )}
      {gameOver && (
        <div className={styles.gameOverOverlay}>
          <div>
            <strong>GAME OVER</strong>
            <div className={styles.finalScore}>Score: {score}</div>
            <div className={styles.restartHint}>(Press any key to restart)</div>
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        <span>
          Controls: [←] Left &nbsp; [→] Right &nbsp; [↓] Down &nbsp; [↑] Rotate &nbsp; [Space] Hard Drop &nbsp; [P] Pause
        </span>
      </footer>
    </div>
  );
}

export default TetrisGame;
