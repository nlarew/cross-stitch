function getCellIndex(row, col, dimension) {
  const previousRowsPriorCells = (row - 1) * dimensions.cols;
  const thisRowPriorCells = col - 1;
  return previousRowsPriorCells + thisRowPriorCells;
}

function getCellPosFromIndex(idx, dimensions) {
  const row = parseInt(idx / dimensions.cols);
  const col = idx % dimensions.cols;
  return { row, col };
}

function createCellMapper(puzzle) {
  const dimensions = puzzle.size;
  function mapGridToCell(answer, idx) {
    const { row, col } = getCellPosFromIndex(idx, dimensions);
    try {
      const isVoid = answer == ".";
      const isPuzzleEdge = {
        top: row == 0,
        left: col == 0,
        right: col == dimensions.cols - 1,
        bottom: row == dimensions.rows - 1,
      };
      const isVoidEdge = {
        top: isPuzzleEdge.top
          ? isVoid
          : puzzle.grid[idx - dimensions.cols].answer == ".",
        right: isPuzzleEdge.right ? isVoid : puzzle.grid[idx + 1].answer == ".",
        bottom: isPuzzleEdge.bottom
          ? isVoid
          : puzzle.grid[idx + dimensions.cols].answer == ".",
        left: isPuzzleEdge.left ? isVoid : puzzle.grid[idx - 1].answer == ".",
      };
      return {
        pos: { row, col },
        answer,
        isVoid,
        isPuzzleEdge,
        isVoidEdge,
        isSelected: idx == 0, // true for the first cell
        isInClue: row == 0, // true for the first row (when across)
        isAdjacent: col == 0, // true for the first col (when across)
        gridnum: puzzle.gridnums[idx],
        value: "",
      };
    } catch (err) {
      console.log(row, col, err);
    }
  }
  return mapGridToCell;
}

class Puzzle {
  constructor(puzzle) {
    this.dimensions = puzzle.size;
    this.selectedCell = false;
    this.direction = "across";
    this.clues = puzzle.clues;
    const mapGridToCell = createCellMapper(puzzle);
    this.cells = puzzle.grid.map(mapGridToCell);
  }

  static from(puzzle) {
    return new Puzzle(puzzle);
  }

  toJson() {
    return {
      dimensions: this.dimensions,
      selectedCell: this.selectedCell,
      direction: this.direction,
      cells: this.cells,
      clues: this.clues,
    };
  }
}

export default Puzzle;
