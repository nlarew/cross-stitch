import React, { useEffect, useState, useReducer } from "react";
import useKey from "use-key-hook";
import styled from "@emotion/styled";
import Cell from "./Cell.js";

function getCellIndex(row, col, dimensions) {
  const previousRowsPriorCells = row * dimensions.cols;
  const thisRowPriorCells = col;
  return previousRowsPriorCells + thisRowPriorCells;
}

function getNextCellPos(row, col, direction, dimensions) {
  switch (direction) {
    case "across": {
      const isLastInRow = col === dimensions.cols - 1; // Last column
      if (isLastInRow) {
        return {
          row: (row + 1) % dimensions.rows,
          col: 0,
        };
      } else {
        return {
          row: row,
          col: (col + 1) % dimensions.cols,
        };
      }
    }
    case "down": {
      const isLastInCol = row === dimensions.rows - 1; // Last row
      if (isLastInCol) {
        return {
          row: 0,
          col: (col + 1) % dimensions.cols,
        };
      } else {
        return {
          row: (row + 1) % dimensions.rows,
          col: col,
        };
      }
    }
  }
}
function getPreviousCellPos(row, col, direction, dimensions) {
  switch (direction) {
    case "across": {
      const isFirstInRow = col % dimensions.cols == 0; // First column
      if (isFirstInRow) {
        return {
          row: row - 1,
          col: dimensions.cols - 1,
        };
      } else {
        return {
          row: row,
          col: col - 1,
        };
      }
    }
    case "down": {
      const isFirstInCol = row % dimensions.rows == 0; // First row
      if (isFirstInCol) {
        return {
          row: dimensions.rows - 1,
          col: col - 1,
        };
      } else {
        return {
          row: row - 1,
          col: col,
        };
      }
    }
  }
}

function getNextNonVoidCellPos(row, col, direction, cells, dimensions) {
  const nextPos = getNextCellPos(row, col, direction, dimensions);

  const next = cells[getCellIndex(nextPos.row, nextPos.col, dimensions)];
  if (next.isVoid) {
    console.log(`next is void`);
    return getNextNonVoidCellPos(
      nextPos.row,
      nextPos.col,
      direction,
      cells,
      dimensions,
    );
  } else {
    return nextPos;
  }
}

function getPreviousNonVoidCellPos(row, col, direction, cells, dimensions) {
  const prevPos = getPreviousCellPos(row, col, direction, dimensions);
  const prev = cells[getCellIndex(prevPos.row, prevPos.col, dimensions)];
  if (prev.isVoid) {
    return getPreviousNonVoidCellPos(
      prevPos.row,
      prevPos.col,
      direction,
      cells,
      dimensions,
    );
  } else {
    return prevPos;
  }
}

export default function Board(props) {
  const dimensions = props.dimensions;
  const Layout = styled.div`
    max-width: ${dimensions.cols * 32}px;
    display: grid;
    grid-template-rows: repeat(${dimensions.rows}, 1fr);
    grid-template-columns: repeat(${dimensions.cols}, 1fr);
    padding-left: 20px;
  `;

  const { cells, direction, selectedCell } = props.board;
  const dispatch = props.dispatch;

  const setCell = payload => {
    console.log(`setCell`, payload);
    dispatch({ type: "setCellValue", payload });
  };

  const toggleDirection = () => {
    dispatch({ type: "toggleDirection" });
  };

  const setSelected = pos => {
    console.log(`setSelected { row: ${pos.row}, col: ${pos.col} }`);
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
        const next = getNextNonVoidCellPos(
          selected.row,
          selected.col,
          direction,
          cells,
          dimensions,
        );
        setSelected(next);
      } else {
        const pressedKey = {
          8: "delete",
          32: "space",
          37: "left",
          38: "up",
          39: "right",
          40: "down",
        }[keyNum];
        const handler = {
          delete: () => {
            setCell({
              pos: { row: selected.row, col: selected.col },
              value: "",
            });
          },
          left: () => {
            console.log("left");
            const prev = getPreviousNonVoidCellPos(
              selected.row,
              selected.col,
              "across",
              cells,
              dimensions,
            );
            console.log("prev", prev);
            setSelected(prev);
          },
          up: () => {
            const next = getPreviousNonVoidCellPos(
              selected.row,
              selected.col,
              "down",
              cells,
              dimensions,
            );
            setSelected(next);
          },
          right: () => {
            const next = getNextNonVoidCellPos(
              selected.row,
              selected.col,
              "across",
              cells,
              dimensions,
            );
            setSelected(next);
          },
          down: () => {
            const next = getNextNonVoidCellPos(
              selected.row,
              selected.col,
              "down",
              cells,
              dimensions,
            );
            setSelected(next);
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
        .concat([8]) // Delete
        .concat([32]) // Space
        .concat([37, 38, 39, 40]) // Arrow Keys
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
  return <Layout>{renderCells()}</Layout>;
}
