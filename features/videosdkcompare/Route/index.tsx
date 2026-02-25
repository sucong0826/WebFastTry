import React from "react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import Meeting from "../Pages/Meeting";
import Config from "../Pages/Config";

const RoutePath = {
  Login: "/login",
  Meeting: "/meeting",
  Config: "/config",
};

const AppRouter: React.FC = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/config" element={<Config />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MemoryRouter>
  );
};

export { RoutePath, AppRouter };
