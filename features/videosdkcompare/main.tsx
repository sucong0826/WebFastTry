import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { AppRouter } from "./Route";
import { store } from "./Redux/store";
import "./index.scss";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>
);
