import React from "react";
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
  const Container = React.memo(styled.div`
    position: relative;
    width: 32px;
    height: 32px;
    background-color: ${isSelected
      ? "#5CAB7D"
      : isInClue
      ? "#bfe0da"
      : "#fefefe"};
    text-align: center;
    line-height: 32px;

    // Cell Borders
    box-sizing: border-box;
    border-top: ${isPuzzleEdge.top
      ? "1px solid #000000"
      : "0.5px solid #dfdfdf"};
    border-right: ${isPuzzleEdge.right
      ? "1px solid #000000"
      : "0.5px solid #dfdfdf"};
    border-bottom: ${isPuzzleEdge.bottom
      ? "1px solid black"
      : "0.5px solid #dfdfdf"};
    border-left: ${isPuzzleEdge.left
      ? "1px solid #000000"
      : "0.5px solid #dfdfdf"};
  `);

  const VoidContainer = React.memo(styled(Container)`
    background-color: black;
    border-color: black;
  `);

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
