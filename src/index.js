import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { asAnonUser } from "./stitch.js";
import styled from "@emotion/styled";

import Board from "./components/Board.js";

import Typography from "typography";
import doelgerTheme from "typography-theme-doelger";
import funstonTheme from "typography-theme-funston";

const typography = new Typography(funstonTheme);
typography.injectStyles();

function App() {
  return (
    <div className="App">
      <h1>Game Grid</h1>
      <Board dimensions={{ rows: 15, cols: 15 }} />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
