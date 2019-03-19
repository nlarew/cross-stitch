import React from 'react';
import styled from "@emotion/styled";

const Container = styled.div`
  box-sizing: border-box;
  max-height: 100%;
  display: flex;
  flex-direction: column;
`

const ClueListHeader = styled.h2`
  margin: 0;
  font-size: 1em;
  background-color: #bfe0da;
  padding: 2px 4px;
`;

const ScrollableArea = styled.ul`
  list-style-type: none;
  overflow-y: scroll;
  margin: 0;
  padding-inline-start: 0px;
`;

const ClueListItem = styled.li`
  border-bottom: 0.5px solid #bfe0da;
  padding-top: 2px;
  padding-bottom: 2px;
  list-style-type: none;
  display: flex;
  flex-direction: row;
  background-color: ${props => {
    return (props.isCurrentClue ? "#bfe0da" : "inherit")
  }};
`;

const ClueNumber = styled.span`
  padding-left: 4px;
  padding-right: 8px;
  width: 30px;
  text-align: right;
`;

const ClueText = styled.span`
  width: calc(100% - 30px);
`

function ClueList({
  clueDirection,
  clues,
  direction,
  selectedCell,
  dispatch,
  getClueStartCell,
  currentClue
}) {

  return (
    <Container>
      <ClueListHeader>{clueDirection}</ClueListHeader>
      <ScrollableArea>
        {clues.map(clue => {
          const { number, text } = clue;
          const isCurrentDirection = direction.toUpperCase() === clueDirection.toUpperCase();
          const isCurrentClue = isCurrentDirection && currentClue && currentClue.number === number
          const handleClick = () => {
            const clueStart = getClueStartCell(number);
            dispatch({ type: "setSelectedCell", payload: clueStart });
            if (!isCurrentDirection) {
              dispatch({ type: "toggleDirection" });
            }
          };
          return (
            <ClueListItem
              key={number}
              onClick={handleClick}
              isCurrentClue={isCurrentClue}
            >
              <ClueNumber>{number}.</ClueNumber>
              <ClueText>{text}</ClueText>
            </ClueListItem>
          );
        })}
      </ScrollableArea>
    </Container>
  );
}

export default ClueList
