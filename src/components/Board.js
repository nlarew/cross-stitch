import React from "react";
import useKey from "use-key-hook";
import styled from "@emotion/styled";
import Cell from "./Cell.js";

export default function Board(props) {
  const { dimensions } = props;
  const Layout = styled.div`
    max-width: ${dimensions.cols * 32}px;
    display: grid;
    grid-template-rows: repeat(${dimensions.rows}, 1fr);
    grid-template-columns: repeat(${dimensions.cols}, 1fr);
  `;

  const {
    getNextNonVoidCellPos,
    getPreviousNonVoidCellPos,
    getNextClueStartCellPos,
    getPreviousClueEndCellPos
  } = props;

  const { cells, direction, selectedCell, currentClue } = props.board;

  const dispatch = props.dispatch;

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
  const currentClueRef = React.useRef();
  currentClueRef.current = currentClue;

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
      const currentClue = currentClueRef.current;

      const isLetter = () => {
        return (
          letters.uppercase.includes(keyNum) ||
          letters.lowercase.includes(keyNum)
        );
      };

      const lastCellInClue = currentClue && currentClue.cells[currentClue.cells.length - 1];
      const isLastCellInClue = lastCellInClue && selected.row === lastCellInClue.row && selected.col === lastCellInClue.col
      const firstCellInClue = currentClue && currentClue.cells[0];
      const isFirstCellInClue = firstCellInClue && selected.row === firstCellInClue.row && selected.col === firstCellInClue.col
      if (isLetter()) {
        const letter = String.fromCharCode(keyNum);
        setCell({
          pos: { row: selected.row, col: selected.col },
          value: letter,
        });
        const next = isLastCellInClue
          ? getNextClueStartCellPos(currentClue.number, direction)
          : getNextNonVoidCellPos(
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
          13: "enter",
          32: "space",
          37: "left",
          38: "up",
          39: "right",
          40: "down",
          46: "delete",
        }[keyNum];
        const handler = {
          delete: () => {
            const cell =
              cells[props.getCellIndex(selected.row, selected.col, dimensions)];
            if (cell.value === "") {
              const prev = isFirstCellInClue
                ? getPreviousClueEndCellPos(currentClue.number, direction)
                : getPreviousNonVoidCellPos(
                    selected.row,
                    selected.col,
                    direction,
                    cells,
                    dimensions
                  );
              setSelected(prev);
            } else {
              setCell({
                pos: { row: selected.row, col: selected.col },
                value: "",
              });
            }
          },
          enter: () => {
            const next = isLastCellInClue
              ? getNextClueStartCellPos(currentClue.number, direction)
              : getNextNonVoidCellPos(
                selected.row,
                selected.col,
                direction,
                cells,
                dimensions,
              );
            setSelected(next);
          },
          left: () => {
            const prev = getPreviousNonVoidCellPos(
              selected.row,
              selected.col,
              "across",
              cells,
              dimensions,
            );
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
      // eslint-disable-next-line
      detectKeys: new Array()
        .concat([8, 13, 46]) // Backspace & Enter & Delete
        .concat([32]) // Space
        .concat([37, 38, 39, 40]) // Arrow Keys
        .concat(letters.uppercase)
        .concat(letters.lowercase),
    },
  );

  const renderCells = currentClue => {
    return cells.map(cellData => {
      const { row, col } = cellData.pos;
      const isSelected = (row, col) =>
        row === null || col === null
          ? false
          : selectedCell.row === row && selectedCell.col === col;
      const isInClue = (row, col) => {
        return currentClue && currentClue.cells.filter(cell => cell.row === row && cell.col === col).length > 0;
      };
      const isAdjacent = (row, col) => {
        switch (direction) {
          case "across": {
            return col === selectedCell.col;
          }
          case "down": {
            return row === selectedCell.row;
          }
          default: {
            console.error(`Bad direction: ${direction}`);
          }
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
  return <Layout>{renderCells(currentClue)}</Layout>;
}
