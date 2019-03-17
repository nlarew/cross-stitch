import React, { Fragment } from "react";
import styled from "@emotion/styled";

export default React.memo(function Cell({
  pos,
  value,
  gridnum,
  answer,
  handleClick,
  isPuzzleEdge,
  isSelected,
  isInClue,
  isAdjacent,
  isVoid = false,
}) {
  const { row, col } = pos;
  const bgcolor = ({ row, col }) => {
    const isEvenRow = row % 2 == 0;
    const isEvenCol = col % 2 == 0;
    return isEvenRow
      ? isEvenCol
        ? "#cff0da"
        : "#88dba3"
      : isEvenCol
      ? "#bbe84b"
      : "#3ac569";
  };
  const Container = styled.div`
    position: relative;
    width: 32px;
    height: 32px;
    background-color: ${isSelected ? "#00ff00" : bgcolor({ row, col })};
    background-color: ${isSelected
      ? "#00ff00"
      : isAdjacent
      ? "#C5E99B"
      : isInClue
      ? "#00dd00"
      : "#cff0da"};
    text-align: center;
    line-height: 32px;

    // Cell Borders
    box-sizing: border-box;
    border-top: ${isPuzzleEdge.top
      ? "1px solid #000000"
      : "0.5px solid #bfe0da"};
    border-right: ${isPuzzleEdge.right
      ? "1px solid #000000"
      : "0.5px solid #bfe0da"};
    border-bottom: ${isPuzzleEdge.bottom
      ? "1px solid black"
      : "0.5px solid #bfe0da"};
    border-left: ${isPuzzleEdge.left
      ? "1px solid #000000"
      : "0.5px solid #bfe0da"};
  `;

  const VoidContainer = styled(Container)`
    background-color: black;
    border-color: black;
  `;

  const GridNumber = styled.span`
    position: absolute;
    top: -10px;
    left: 2px;
    font-size: 0.4em;
    z-index: 1;
  `;

  const CellValue = styled.span`
    font-size: 1em;
    z-index: 2;
  `;

  return (
    <>
      {isVoid ? (
        <VoidContainer />
      ) : (
        <Container onClick={() => handleClick(row, col)}>
          <GridNumber>{gridnum !== 0 && gridnum}</GridNumber>
          <CellValue>{value && value.toUpperCase()}</CellValue>
        </Container>
      )}
    </>
  );
});
