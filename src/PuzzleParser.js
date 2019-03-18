function _getCellPosFromIndex(idx, dimensions) {
  const row = parseInt(idx / dimensions.cols);
  const col = idx % dimensions.cols;
  return { row, col };
}

function createCellMapper(puzzle) {
  const dimensions = puzzle.size;
  function mapGridToCell(answer, idx) {
    const { row, col } = _getCellPosFromIndex(idx, dimensions);
    try {
      const isVoid = answer === ".";
      const isPuzzleEdge = {
        top: row === 0,
        left: col === 0,
        right: col === dimensions.cols - 1,
        bottom: row === dimensions.rows - 1,
      };
      const isVoidEdge = {
        top: isPuzzleEdge.top
          ? isVoid
          : puzzle.grid[idx - dimensions.cols].answer === ".",
        right: isPuzzleEdge.right ? isVoid : puzzle.grid[idx + 1].answer === ".",
        bottom: isPuzzleEdge.bottom
          ? isVoid
          : puzzle.grid[idx + dimensions.cols].answer === ".",
        left: isPuzzleEdge.left ? isVoid : puzzle.grid[idx - 1].answer === ".",
      };
      return {
        pos: { row, col },
        answer,
        isVoid,
        isPuzzleEdge,
        isVoidEdge,
        isSelected: idx === 0, // true for the first cell
        isInClue: row === 0, // true for the first row (when across)
        isAdjacent: col === 0, // true for the first col (when across)
        gridnum: puzzle.gridnums[idx],
        value: "",
      };
    } catch (err) {
      console.log(row, col, err);
    }
  }
  return mapGridToCell;
}

function mapClues(puzzle, direction) {
  const { clues, answers } = puzzle;
  function getCellsForClue(clueIndex) {
    // From clues.across[clueIndex], get clue number
    // getClueStartCell() -> start: { row, col }
    // getClueStartIndex(start) -> idx
    // find cells in same word (based on length from clue start OR include next until answer == ".")
  }

  return clues[direction].map((clue, idx) => {
    let [number, ...rest] = clue.split(". ");
    number = number.toString();
    const text = rest.join(". ");
    const answer = {
      text: answers[direction][idx],
      cells: getCellsForClue(idx)
    }
    return { number, text, answer };
  })
}

class PuzzleParser {
  constructor(puzzle) {
    this.gridnums = puzzle.gridnums
    this.dimensions = puzzle.size;
    this.selectedCell = false;
    this.direction = "across";
    this.clues = {
      across: mapClues(puzzle, "across"),
      down: mapClues(puzzle, "down"),
    };
    const mapGridToCell = createCellMapper(puzzle);
    this.cells = puzzle.grid.map(mapGridToCell);

    this.utils = {
      getCellIndex: this.getCellIndex,
      getCellPosFromIndex: this.getCellPosFromIndex,
      getNextNonVoidCellPos: this.getNextNonVoidCellPos,
      getPreviousNonVoidCellPos: this.getPreviousNonVoidCellPos,
      getClueStartCell: this.getClueStartCell,
    }
  }

  static parse(puzzle) {
    return new PuzzleParser(puzzle);
  }

  getCellPosFromIndex = idx => {
    return _getCellPosFromIndex(idx, this.dimensions);
  };

  getCellIndex = (row, col) => {
    const previousRowsPriorCells = row * this.dimensions.cols;
    const thisRowPriorCells = col;
    return previousRowsPriorCells + thisRowPriorCells;
  };

  getNextCellPos = (row, col, direction) => {
    const dimensions = this.dimensions;
    switch (direction) {
      case "across": {
        const isLastInRow = col === dimensions.cols - 1; // Last column
        if (isLastInRow) {
          return {
            row: (row + 1) % dimensions.rows,
            col: 0
          };
        } else {
          return {
            row: row,
            col: (col + 1) % dimensions.cols
          };
        }
      }
      case "down": {
        const isLastInCol = row === dimensions.rows - 1; // Last row
        if (isLastInCol) {
          return {
            row: 0,
            col: (col + 1) % dimensions.cols
          };
        } else {
          return {
            row: (row + 1) % dimensions.rows,
            col: col
          };
        }
      }
      default: {
        console.error(`Bad direction: ${direction}`);
      }
    }
  };

  getPreviousCellPos = (row, col, direction) => {
    const dimensions = this.dimensions;
    switch (direction) {
      case "across": {
        const isFirstInRow = col % dimensions.cols === 0; // First column
        if (isFirstInRow) {
          return {
            row: row - 1,
            col: dimensions.cols - 1
          };
        } else {
          return {
            row: row,
            col: col - 1
          };
        }
      }
      case "down": {
        const isFirstInCol = row % dimensions.rows === 0; // First row
        if (isFirstInCol) {
          return {
            row: dimensions.rows - 1,
            col: col - 1
          };
        } else {
          return {
            row: row - 1,
            col: col
          };
        }
      }
      default: {
        console.error(`Bad direction: ${direction}`);
      }
    }
  };

  getNextNonVoidCellPos = (row, col, direction, cells) => {
    const nextPos = this.getNextCellPos(row, col, direction);

    const next = cells[this.getCellIndex(nextPos.row, nextPos.col)];
    if (next && next.isVoid) {
      return this.getNextNonVoidCellPos(
        nextPos.row,
        nextPos.col,
        direction,
        cells
      );
    } else {
      return nextPos;
    }
  };

  getPreviousNonVoidCellPos = (row, col, direction, cells) => {
    const prevPos = this.getPreviousCellPos(row, col, direction);
    const prev = cells[this.getCellIndex(prevPos.row, prevPos.col)];
    if (prev && prev.isVoid) {
      return this.getPreviousNonVoidCellPos(
        prevPos.row,
        prevPos.col,
        direction,
        cells
      );
    } else {
      return prevPos;
    }
  };

  getClueStartCell = (clueNum) => {
    console.log("gridnums:", this.gridnums[26])
    const idx = this.gridnums.indexOf(parseInt(clueNum));
    const pos = this.getCellPosFromIndex(idx);
    return pos;
  }

  cellsInSameClueAsCell = (selectedCell, direction) => {
    switch (direction) {
      case "across": {
        return selectedCell.row;
      }
      case "down": {
        return selectedCell.col;
      }
      default: {
        console.error(`Bad direction: ${direction}`)
      }
    }
  };

  toJson() {
    return {
      dimensions: this.dimensions,
      selectedCell: this.selectedCell,
      direction: this.direction,
      cells: this.cells,
      clues: this.clues
    };
  }
}

export default PuzzleParser;
