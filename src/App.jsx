import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import Layout from "./Layout/Layout";
import Home from "./Pages/Home/Home";
import DashboardResult from "./Pages/DashboardResult/DashboardResult";
import Glasses from "./Pages/Glasses";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Glasses" element={<Glasses />} />
          <Route path="DashboardResult" element={<DashboardResult />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;