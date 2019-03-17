import * as R from "ramda";

const dimensions = { rows: 15, cols: 15 };
function getCellIndex(row, col) {
  const previousRowsPriorCells = (row - 1) * dimensions.cols;
  const thisRowPriorCells = col - 1;
  return previousRowsPriorCells + thisRowPriorCells;
}

const state = {
  dimensions: { rows: 15, cols: 15 },
  selectedCell: { row: 4, col: 2 },
  cells: [
    {
      row: 0,
      col: 0,
      gridnum: 1,
      isVoid: false,
      value: "A",
      answer: "A",
      isPuzzleEdge: {
        top: true,
        right: false,
        bottom: false,
        left: true,
      },
      isVoidEdge: {
        top: false,
        right: true,
        bottom: false,
        left: false,
      },
      isSelected: false,
      isInClue: false,
      isAdjacent: false,
    },
  ],
  direction: "down",
  clues: {
    across: [],
    down: [],
  },
  solved: [],
};

export default state.cells(getCellIndex(3, 2));
