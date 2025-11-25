export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES = {
  I : [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  J : [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]],
  ],
  L : [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
  O : [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  S : [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  T : [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
  Z : [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[2,1],[1,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]],
  ]
};

TETROMINOES.I.color = "#2563EB"; // Ocean blue
TETROMINOES.J.color = "#F59E0B"; // Amber
TETROMINOES.L.color = "#EF4444"; // Red
TETROMINOES.O.color = "#22D3EE"; // Cyan
TETROMINOES.S.color = "#38BDF8"; // Sky blue
TETROMINOES.T.color = "#6366F1"; // Indigo
TETROMINOES.Z.color = "#111827"; // Near-black
TETROMINOES.I.ghost = "#2563EB";
TETROMINOES.J.ghost = "#F59E0B";
TETROMINOES.L.ghost = "#EF4444";
TETROMINOES.O.ghost = "#22D3EE";
TETROMINOES.S.ghost = "#38BDF8";
TETROMINOES.T.ghost = "#6366F1";
TETROMINOES.Z.ghost = "#111827";

// Bag randomizer (7 tetromino shuffle)
export function randomBag() {
  const bag = Object.keys(TETROMINOES).slice(0, 7);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Rotate shape left/right
export function rotate(type, prevRotation, dir = 1) {
  return (prevRotation + dir + 4) % 4;
}

// Create empty board
export function emptyBoard() {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

// Collision detection (returns true if piece would collide at its position+rotation)
export function checkCollision(board, piece) {
  const { type, pos, rotation } = piece;
  const shape = TETROMINOES[type][rotation];
  for (let k = 0; k < shape.length; k++) {
    const [dx, dy] = shape[k];
    const x = pos.x + dx;
    const y = pos.y + dy;
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true;
    if (y >= 0 && board[y][x]) return true;
  }
  return false;
}
