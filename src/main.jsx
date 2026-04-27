import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css"
import { BrowserRouter } from "react-router-dom";
import 'material-symbols';
import { Notifications } from "@mantine/notifications";
import { LoaderProvider } from "./common/LoaderContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <LoaderProvider>
        <MantineProvider>
          <Notifications position="top-right" containerWidth={350} />
          <App />
        </MantineProvider>
      </LoaderProvider>
    </BrowserRouter>,
  // </React.StrictMode>
);
