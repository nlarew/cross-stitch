import React, { useEffect, useState, useReducer, createContext } from "react";
import ReactDOM from "react-dom";
import { asAnonUser } from "./stitch.js";
import styled from "@emotion/styled";
import * as R from "ramda";

import Board from "./components/Board.js";

import Typography from "typography";
import doelgerTheme from "typography-theme-doelger";
import funstonTheme from "typography-theme-funston";
import bootstrapTheme from "typography-theme-bootstrap";

const typography = new Typography(funstonTheme);
typography.injectStyles();

import Puzzle from "./Puzzle.js";
const puz = require("./puzzles/nov_17.json");
const puzzle = Puzzle.from(puz).toJson();

function getCellIndex(row, col, dimensions) {
  const previousRowsPriorCells = row * dimensions.cols;
  const thisRowPriorCells = col;
  return previousRowsPriorCells + thisRowPriorCells;
}
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
      const idx = getCellIndex(row, col, state.dimensions);
      const cell = R.clone(state.cells[idx]);
      // Select Next Cell
      const next = { row, col };
      const updatedCells = R.update(idx, { ...cell, value }, state.cells);
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
      console.log(`setSelectedPos: { row: ${row}, col: ${col} }`);
      return { ...state, selectedCell: { row, col } };
    }
    case "toggleDirection": {
      // { payload: null }
      // Change the clue direction from "across" to "row" or vice-versa
      const direction = state.direction == "across" ? "down" : "across";
      return { ...state, direction };
    }
    default: {
      throw new Error(`Not a valid action type: ${action}`);
    }
  }
}

const PuzzleContext = createContext({});

function PuzzleUI(props) {
  // container for the game
  const Layout = styled.div`
    display: flex;
    flex-direction: row;
  `;

  const [puzzle, dispatch] = useReducer(puzzleReducer, initialPuzzleState);
  const dimensions = { rows: 15, cols: 15 };
  const board = {
    cells: puzzle.cells,
    direction: puzzle.direction,
    selectedCell: puzzle.selectedCell,
  };

  return (
    <Layout>
      <Board dimensions={dimensions} board={board} dispatch={dispatch} />
    </Layout>
  );
}

function MenuUI(props) {}

function App() {
  return (
    <div className="App">
      <h1>Game Grid</h1>
      <PuzzleUI />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
