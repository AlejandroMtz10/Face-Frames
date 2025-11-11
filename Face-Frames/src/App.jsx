import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home/Home";
import Glasses from "./Pages/Glasses";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Glasses" element={<Glasses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;