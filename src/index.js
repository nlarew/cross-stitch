import React, { useReducer, useMemo } from "react";
import ReactDOM from "react-dom";
// import { asAnonUser } from "./stitch.js";
import styled from "@emotion/styled";
import * as R from "ramda";

import Board from "./components/Board.js";
import ClueList from "./components/ClueList.js";
import PuzzleParser from "./PuzzleParser.js";

// import Typography from "typography";
// import doelgerTheme from "typography-theme-doelger";
// import funstonTheme from "typography-theme-funston";
// import bootstrapTheme from "typography-theme-bootstrap";

// const typography = new Typography(funstonTheme);
// typography.injectStyles();

const puz = require("./puzzles/nov_17.json");
const parsed = PuzzleParser.parse(puz)
const {
  getCellIndex,
  getNextNonVoidCellPos,
  getPreviousNonVoidCellPos,
  getClueStartCell,
  getClueForCell
} = parsed.utils;
const puzzle = parsed.toJson();

const initialPuzzleState = puzzle;
function puzzleReducer(state, action) {
  switch (action.type) {
    case "setCellValue": {
      // { payload: { pos: { row, col }, value } }
      // Set Value
      const {
        pos: { row = 0, col = 0 },
        value,
      } = action.payload;
      const idx = getCellIndex(row, col);
      const cell = R.clone(state.cells[idx]);
      // Select Next Cell
      const next = { row, col };
      return {
        ...state,
        selected: next,
        cells: R.update(idx, { ...cell, value }, state.cells),
      };
    }
    case "setSelectedCell": {
      // { payload: { row, col } }
      // If the specified cell is not currently selected,
      // set the value of selectedCell to the specified cell
      const { row, col } = action.payload;
      return { ...state, selectedCell: { row, col } };
    }
    case "toggleDirection": {
      // { payload: null }
      // Change the clue direction from "across" to "row" or vice-versa
      const direction = state.direction === "across" ? "down" : "across";
      return { ...state, direction };
    }
    default: {
      throw new Error(`Not a valid action type: ${action}`);
    }
  }
}

const Topbar = styled.div`
  grid-area: topbar;
  display: flex;
  flex-direction: row;
`;

const Title = styled.h1`
  margin: 0;
`;

function PuzzleUI(props) {
  const dimensions = { rows: 15, cols: 15 };
  const [puzzle, dispatch] = useReducer(puzzleReducer, initialPuzzleState);
  const { cells, direction, selectedCell } = puzzle
  const currentClue = getClueForCell(selectedCell, direction);

  const board = { cells, direction, selectedCell, currentClue };
  console.log("currentClue", currentClue);

  // container for the game
  const AppLayout = styled.div`
    display: grid;
    grid-template-areas:
      "topbar topbar topbar"
      "board  board  clues"
      "board  board  clues";
    grid-template-rows: 50px 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr;
    max-height: ${dimensions.rows * 32 + 50}px;
    max-width: ${dimensions.cols * 32 * 1.5}px;
  `;
  const BoardArea = styled.div`
    grid-area: board;
  `;
  const ClueArea = styled.div`
    grid-area: clues;
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    border-left: none;
    max-height: 100%;
  `;

  return (
    <AppLayout>
      <Topbar>
        <Title>Cross-Stitch</Title>
      </Topbar>
      <BoardArea>
        <Board
          dimensions={dimensions}
          board={board}
          dispatch={dispatch}
          getCellIndex={getCellIndex}
          getNextNonVoidCellPos={getNextNonVoidCellPos}
          getPreviousNonVoidCellPos={getPreviousNonVoidCellPos}
        />
      </BoardArea>
      <ClueArea>
        <ClueList
          clues={puzzle.clues.across}
          clueDirection="Across"
          dispatch={dispatch}
          selectedCell={puzzle.selectedCell}
          direction={puzzle.direction}
          getClueStartCell={getClueStartCell}
          currentClue={currentClue}
        />
        <ClueList
          clues={puzzle.clues.down}
          clueDirection="Down"
          dispatch={dispatch}
          selectedCell={puzzle.selectedCell}
          direction={puzzle.direction}
          getClueStartCell={getClueStartCell}
          currentClue={currentClue}
        />
      </ClueArea>
    </AppLayout>
  );
}

function App() {
  return (
    <PuzzleUI />
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
