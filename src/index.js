import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { asAnonUser } from "./stitch.js";
import styled from "@emotion/styled";

import Board from "./components/Board.js";

import Typography from "typography";
import doelgerTheme from "typography-theme-doelger";
import funstonTheme from "typography-theme-funston";
import bootstrapTheme from "typography-theme-bootstrap";

const typography = new Typography(funstonTheme);
typography.injectStyles();

function Puzzle(props) {
  // container for the game
  const Layout = styled.div`
    display: flex;
    flex-direction: row;
  `;

  const dimensions = { rows: 15, cols: 15 };

  return (
    <Layout>
      <Board dimensions={dimensions} />
    </Layout>
  );
}

function MenuUI(props) {}

function App() {
  return (
    <div className="App">
      <h1>Game Grid</h1>
      <Puzzle />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
