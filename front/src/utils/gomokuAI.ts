type Board = ('B' | 'W' | null)[][];
type Player = 'B' | 'W';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Position {
  row: number;
  col: number;
}

interface MoveEvaluation {
  position: Position;
  score: number;
}

export class GomokuAI {
  private boardSize: number;
  private player: Player;
  private opponent: Player;
  private difficulty: Difficulty;

  constructor(boardSize: number = 15, aiPlayer: Player = 'W', difficulty: Difficulty = 'medium') {
    this.boardSize = boardSize;
    this.player = aiPlayer;
    this.opponent = aiPlayer === 'B' ? 'W' : 'B';
    this.difficulty = difficulty;
  }

  public setDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  public getBestMove(board: Board): Position | null {
    const centerRow = Math.floor(this.boardSize / 2);
    const centerCol = Math.floor(this.boardSize / 2);

    // If the board is empty or the center is available, take the center.
    const isBoardEmpty = board.every(row => row.every(cell => cell === null));
    if (isBoardEmpty || board[centerRow][centerCol] === null) {
      return { row: centerRow, col: centerCol };
    }

    const availableMoves = this.getAvailableMoves(board);
    if (availableMoves.length === 0) {
      // Fallback if getAvailableMoves returns nothing (e.g. no stones nearby)
      // Find any empty spot.
      for (let r = 0; r < this.boardSize; r++) {
        for (let c = 0; c < this.boardSize; c++) {
          if (board[r][c] === null) {
            return { row: r, col: c };
          }
        }
      }
      return null; // Should not be reached if the board is not full
    }

    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove(board, availableMoves);
      case 'medium':
        return this.getMediumMove(board, availableMoves);
      case 'hard':
        return this.getHardMove(board, availableMoves);
      default:
        return this.getMediumMove(board, availableMoves);
    }
  }

  private getEasyMove(board: Board, availableMoves: Position[]): Position {
    const evaluatedMoves = availableMoves.map(move => ({
      position: move,
      score: this.evaluateMove(board, move)
    }));

    evaluatedMoves.sort((a, b) => b.score - a.score);

    const randomFactor = Math.random();
    if (randomFactor < 0.7) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, availableMoves.length));
      return availableMoves[randomIndex];
    }

    return evaluatedMoves[0].position;
  }

  private getMediumMove(board: Board, availableMoves: Position[]): Position {
    let bestMove: Position | null = null;
    let bestScore = -Infinity;

    for (const move of availableMoves) {
      const score = this.evaluateMove(board, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    const randomFactor = Math.random();
    if (randomFactor < 0.2) {
      const goodMoves = availableMoves
        .map(move => ({ position: move, score: this.evaluateMove(board, move) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const randomIndex = Math.floor(Math.random() * goodMoves.length);
      return goodMoves[randomIndex].position;
    }

    return bestMove!;
  }

  private getHardMove(board: Board, availableMoves: Position[]): Position {
    const evaluatedMoves = availableMoves.map(move => ({
      position: move,
      score: this.evaluateMoveWithLookahead(board, move)
    }));

    evaluatedMoves.sort((a, b) => b.score - a.score);
    return evaluatedMoves[0].position;
  }

  private evaluateMoveWithLookahead(board: Board, move: Position): number {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = this.player;

    let score = this.evaluateMove(board, move);

    const opponentMoves = this.getAvailableMoves(testBoard).slice(0, 3);
    for (const opponentMove of opponentMoves) {
      const opponentTestBoard = testBoard.map(row => [...row]);
      opponentTestBoard[opponentMove.row][opponentMove.col] = this.opponent;

      const opponentScore = this.evaluateMove(opponentTestBoard, opponentMove);
      score -= opponentScore * 0.5;
    }

    return score;
  }

  private getAvailableMoves(board: Board): Position[] {
    const moves: Position[] = [];
    const occupiedPositions = new Set<string>();

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] !== null) {
          occupiedPositions.add(`${row},${col}`);
        }
      }
    }

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] === null && this.hasNearbyStone(board, row, col)) {
          moves.push({ row, col });
        }
      }
    }

    return moves;
  }

  private hasNearbyStone(board: Board, row: number, col: number): boolean {
    const radius = 2;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;
        const newRow = row + dr;
        const newCol = col + dc;
        if (
          newRow >= 0 &&
          newRow < this.boardSize &&
          newCol >= 0 &&
          newCol < this.boardSize &&
          board[newRow][newCol] !== null
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private evaluateMove(board: Board, move: Position): number {
    // Offensive score
    const offensiveBoard = board.map(row => [...row]);
    offensiveBoard[move.row][move.col] = this.player;

    if (this.checkWin(offensiveBoard, move, this.player)) {
      return 100000; // Highest priority: winning move
    }

    // Defensive score
    const defensiveBoard = board.map(row => [...row]);
    defensiveBoard[move.row][move.col] = this.opponent;

    if (this.checkWin(defensiveBoard, move, this.opponent)) {
      return 50000; // Second highest priority: blocking opponent's win
    }

    // If no immediate win/loss, evaluate patterns
    const offensiveScore = this.evaluatePatterns(offensiveBoard, move, this.player);
    const defensiveScore = this.evaluatePatterns(defensiveBoard, move, this.opponent);

    const centerRow = Math.floor(this.boardSize / 2);
    const centerCol = Math.floor(this.boardSize / 2);
    const distanceFromCenter = Math.abs(move.row - centerRow) + Math.abs(move.col - centerCol);
    const centerBonus = (this.boardSize - distanceFromCenter) * 2;

    return offensiveScore + defensiveScore + centerBonus;
  }

  private checkWin(board: Board, lastMove: Position, player: Player): boolean {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal /
      [1, -1]   // diagonal \
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      for (let i = 1; i < 5; i++) {
        const newRow = lastMove.row + dx * i;
        const newCol = lastMove.col + dy * i;
        if (
          newRow >= 0 &&
          newRow < this.boardSize &&
          newCol >= 0 &&
          newCol < this.boardSize &&
          board[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      for (let i = 1; i < 5; i++) {
        const newRow = lastMove.row - dx * i;
        const newCol = lastMove.col - dy * i;
        if (
          newRow >= 0 &&
          newRow < this.boardSize &&
          newCol >= 0 &&
          newCol < this.boardSize &&
          board[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }

  private evaluatePatterns(board: Board, move: Position, player: Player): number {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal /
      [1, -1]   // diagonal \
    ];

    let totalScore = 0;

    for (const [dx, dy] of directions) {
      const line = this.getLine(board, move, dx, dy, player);
      totalScore += this.evaluateLine(line);
    }

    return totalScore;
  }

  private getLine(board: Board, move: Position, dx: number, dy: number, player: Player): string {
    let line = '';
    const maxLength = 9;

    for (let i = -maxLength; i <= maxLength; i++) {
      const newRow = move.row + dx * i;
      const newCol = move.col + dy * i;

      if (
        newRow >= 0 &&
        newRow < this.boardSize &&
        newCol >= 0 &&
        newCol < this.boardSize
      ) {
        if (board[newRow][newCol] === player) {
          line += 'X';
        } else if (board[newRow][newCol] === null) {
          line += '_';
        } else {
          line += 'O';
        }
      } else {
        line += 'B';
      }
    }

    return line;
  }

  private evaluateLine(line: string): number {
    const patterns = [
      { pattern: 'XXXXX', score: 100000 },
      { pattern: '_XXXX_', score: 10000 },
      { pattern: 'XXXX_', score: 1000 },
      { pattern: '_XXXX', score: 1000 },
      { pattern: '_XXX_', score: 2000 }, // Increased from 500
      { pattern: 'XXX_', score: 100 },
      { pattern: '_XXX', score: 100 },
      { pattern: '_XX_', score: 200 }, // Increased from 50
      { pattern: 'XX_', score: 10 },
      { pattern: '_XX', score: 10 }
    ];

    let score = 0;
    for (const { pattern, score: patternScore } of patterns) {
      const matches = (line.match(new RegExp(pattern, 'g')) || []).length;
      score += matches * patternScore;
    }

    return score;
  }
}