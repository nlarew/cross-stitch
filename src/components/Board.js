import React, { useEffect, useState, createContext, useReducer } from "react";
import useKey from "use-key-hook";
import styled from "@emotion/styled";
import Cell from "./Cell.js";

import * as R from "ramda";

import Puzzle from "./../Puzzle.js";
const puz = require("./../puzzles/nov_17.json");
const puzzle = Puzzle.from(puz).toJson();

const BoardContext = createContext({
  dimensions: { rows: null, cols: null },
});

function getCellIndex(row, col, dimensions) {
  const previousRowsPriorCells = row * dimensions.cols;
  const thisRowPriorCells = col;
  return previousRowsPriorCells + thisRowPriorCells;
}
const initialBoardState = puzzle;
function boardReducer(state, action) {
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

export default function Board(props) {
  const dimensions = props.dimensions;
  const Layout = styled.div`
    max-width: ${dimensions.cols * 32}px;
    display: grid;
    grid-template-rows: repeat(${dimensions.rows}, 1fr);
    grid-template-columns: repeat(${dimensions.cols}, 1fr);
  `;

  const [board, dispatch] = useReducer(boardReducer, initialBoardState);
  const { cells, direction, selectedCell } = board;
  const hasSelected = selectedCell.row && selectedCell.col;

  const setCell = payload => {
    dispatch({ type: "setCellValue", payload });
  };

  const toggleDirection = () => {
    dispatch({ type: "toggleDirection" });
  };

  const setSelected = pos => {
    dispatch({ type: "setSelectedCell", payload: pos });
  };

  // Handle clicking a particular cell
  const handleCellClick = (row, col) => {
    if (selectedCell.row === row && selectedCell.col === col) {
      toggleDirection();
    } else {
      setSelected({ row, col });
    }
  };

  const selectedRef = React.useRef();
  selectedRef.current = selectedCell;
  const toggleRef = React.useRef();
  toggleRef.current = toggleDirection;
  const directionRef = React.useRef();
  directionRef.current = direction;

  function keysInRange(start, end) {
    let keys = [];
    for (let i = start; i <= end; i++) {
      keys.push(i);
    }
    return keys;
  }

  const letters = {
    uppercase: keysInRange(65, 90),
    lowercase: keysInRange(97, 122),
  };
  useKey(
    keyNum => {
      const selected = selectedRef.current;
      const direction = directionRef.current;
      const toggleDirection = toggleRef.current;

      const isLetter = () => {
        return (
          letters.uppercase.includes(keyNum) ||
          letters.lowercase.includes(keyNum)
        );
      };

      if (isLetter()) {
        const letter = String.fromCharCode(keyNum);
        setCell({
          pos: { row: selected.row, col: selected.col },
          value: letter,
        });
        const isLast = (direction, value) => {
          return {
            across: () => {
              return value == dimensions.cols - 1;
            },
            down: () => {
              return value == dimensions.rows - 1;
            },
          }[direction]();
        };
        // const nextNonVoidCell = (direction, value) => {
        //   return {
        //     across() {
        //       const isLast = value == dimensions.cols - 1;
        //       // find next cell
        //       const nextCell = isLast("across", selected.col)
        //         ? (selected.row + 1) % dimensions.rows
        //         : selected.row;
        //       // if not void, return pos
        //       // if void, recursively find that cell's next and check again
        //     },
        //     down() {
        //       const isLast = value == dimensions.rows - 1;
        //       const nextCell = isLast("down", selected.row)
        //         ? 0
        //         : (selected.row + 1) % dimensions.rows;
        //       return;
        //     },
        //   }[direction]();
        // };
        setSelected({
          row:
            direction == "across"
              ? isLast("across", selected.col)
                ? (selected.row + 1) % dimensions.rows
                : selected.row
              : isLast("down", selected.row)
              ? 0
              : (selected.row + 1) % dimensions.rows,
          col:
            direction == "across"
              ? isLast("across", selected.col)
                ? 0
                : (selected.col + 1) % dimensions.cols
              : isLast("down", selected.row)
              ? (selected.col + 1) % dimensions.cols
              : selected.col,
        });
      } else {
        const pressedKey = {
          32: "space",
          37: "left",
          38: "up",
          39: "right",
          40: "down",
        }[keyNum];
        const handler = {
          left: () => {
            if (selected.col !== 0) {
              setSelected({ row: selected.row, col: selected.col - 1 });
            }
          },
          up: () => {
            if (selected.row !== 0) {
              setSelected({ row: selected.row - 1, col: selected.col });
            }
          },
          right: () => {
            if (selected.col !== dimensions.cols - 1) {
              setSelected({ row: selected.row, col: selected.col + 1 });
            }
          },
          down: () => {
            if (selected.row !== dimensions.rows - 1) {
              setSelected({ row: selected.row + 1, col: selected.col });
            }
          },
          space: () => {
            toggleDirection();
          },
        }[pressedKey];
        handler();
      }
    },
    {
      detectKeys: new Array()
        .concat([32, 37, 38, 39, 40]) // Space + Arrow Keys
        .concat(letters.uppercase)
        .concat(letters.lowercase),
    },
  );

  const renderCells = () => {
    return cells.map(cellData => {
      const { row, col } = cellData.pos;
      const isSelected = (row, col) =>
        row === null || col === null
          ? false
          : selectedCell.row == row && selectedCell.col == col;
      const isInClue = (row, col) => {
        switch (direction) {
          case "across":
            return row == selectedCell.row;
          case "down":
            return col == selectedCell.col;
        }
      };
      const isAdjacent = (row, col) => {
        switch (direction) {
          case "across":
            return col == selectedCell.col;
          case "down":
            return row == selectedCell.row;
        }
      };
      return (
        <Cell
          {...cellData}
          key={`r${row}c${col}`}
          handleClick={handleCellClick}
          isSelected={isSelected(row, col)}
          isInClue={isInClue(row, col)}
          isAdjacent={isAdjacent(row, col)}
        />
      );
    });
  };
  return (
    <BoardContext.Provider value={{ dimensions: props.dimensions }}>
      <Layout>{renderCells()}</Layout>
    </BoardContext.Provider>
  );
}