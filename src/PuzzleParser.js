function _getCellPosFromIndex(idx, dimensions) {
  const row = parseInt(idx / dimensions.cols);
  const col = idx % dimensions.cols;
  return { row, col };
}

function _getNextCellPos(row, col, direction, dimensions) {
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

function _getPreviousCellPos(row, col, direction, dimensions) {
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
  const { clues, answers, gridnums } = puzzle;
  const dimensions = puzzle.size;
  function getCellsForClue(clueNumber, clueAnswer) {
    const numCells = clueAnswer.length;
    const clueFirstCellPos = _getCellPosFromIndex(gridnums.indexOf(clueNumber), dimensions);
    let clueCellsPos = [clueFirstCellPos];
    for(let i=1; i < numCells; i++) {
      const prev = clueCellsPos[i-1];
      clueCellsPos[i] = _getNextCellPos(prev.row, prev.col, direction, dimensions);
    }
    return clueCellsPos;
  }

  return clues[direction].map((clue, idx) => {
    const [number, ...rest] = clue.split(". ");
    const text = rest.join(". ");
    const answer = answers[direction][idx];
    const cells = getCellsForClue(Number(number), answer);
    return { number, text, answer, cells };
  })
}

class PuzzleParser {
  constructor(puzzle) {
    this.gridnums = puzzle.gridnums;
    this.dimensions = puzzle.size;
    this.selectedCell = false;
    this.direction = "across";
    this.clues = {
      across: mapClues(puzzle, "across"),
      down: mapClues(puzzle, "down")
    };
    const mapGridToCell = createCellMapper(puzzle);
    this.cells = puzzle.grid.map(mapGridToCell);

    this.utils = {
      getCellIndex: this.getCellIndex,
      getCellPosFromIndex: this.getCellPosFromIndex,
      getNextClueStartCellPos: this.getNextClueStartCellPos,
      getPreviousClueEndCellPos: this.getPreviousClueEndCellPos,
      getNextNonVoidCellPos: this.getNextNonVoidCellPos,
      getPreviousNonVoidCellPos: this.getPreviousNonVoidCellPos,
      getClueStartCell: this.getClueStartCell,
      getClueForCell: this.getClueForCell
    };
  }

  // TODO: Run the non-util part of the constructor to update the model whenever state changes
  // Should call update() in the constructor. (Is this possible? Should be I think...)
  // This might need a "usePuzzle" effect
  // update(puzzle) {
  // }

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
    return _getNextCellPos(row, col, direction, dimensions)
  };

  getPreviousCellPos = (row, col, direction) => {
    const dimensions = this.dimensions;
    return _getPreviousCellPos(row, col, direction, dimensions);
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

  getNextClueStartCellPos = (currentClueNumber, direction) => {
    const clues = this.clues[direction]
    const currentClueIndex = clues
      .map((c, i) => [i, c])
      .filter(([idx, clue]) => clue.number === currentClueNumber)[0][0]
    const nextClue = clues[(currentClueIndex + 1) % clues.length];
    return nextClue.cells[0]
  }

  getPreviousClueEndCellPos = (currentClueNumber, direction) => {
    const clues = this.clues[direction]
    const currentClueIndex = clues
      .map((c, i) => [i, c])
      .filter(([idx, clue]) => clue.number === currentClueNumber)[0][0]
    const mod = (x, n) => (x % n + n) % n // This lets -1 underflow to n-1 https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
    const prevClue = clues[mod((currentClueIndex - 1), clues.length)];
    return prevClue.cells[prevClue.cells.length - 1];
  }

  getClueStartCell = clueNum => {
    const idx = this.gridnums.indexOf(parseInt(clueNum));
    const pos = this.getCellPosFromIndex(idx);
    return pos;
  };

  getClueForCell = (cell, direction) => {
    if (!cell.row && cell.row !== 0 && !cell.col && cell.col !== 0) {
      // No cell is selected
      return null;
    }
    // const candidates = this.clues[direction].filter(clue => clue.cells.includes(cell))
    const candidates = this.clues[direction].filter(clue => {
      const cells = clue.cells
      return cells.filter(({ row, col }) => row === cell.row && col === cell.col).length > 0
    })
    if (!candidates.length) {
      throw new Error(
        `No clue for the specified cell: { row: ${cell.row}, col: ${cell.col} }`
      );
    }
    if (candidates.length > 1) {
      throw new Error(`Specified cell has multiple ${direction} clues: { row: ${cell.row}, col: ${cell.col} }`)
    }
    return candidates[0]
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
        console.error(`Bad direction: ${direction}`);
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
