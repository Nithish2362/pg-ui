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

const theme = {
  primaryColor: 'brand',
  colors: {
    brand: [
      '#eef7fd',
      '#dcf0fb',
      '#b2def5',
      '#87ccef',
      '#5dbbe9',
      '#3f92c5', // Base color
      '#3480ae',
      '#296b92',
      '#1e5676',
      '#13415a',
    ],
    red: [
      '#fff5f5',
      '#ffe3e3',
      '#ffc9c9',
      '#ffa8a8',
      '#ff8787',
      '#fa5252', // Base color
      '#f03e3e',
      '#e03131',
      '#c92a2a',
      '#b01e1e',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <LoaderProvider>
        <MantineProvider theme={theme}>
          <Notifications position="top-right" containerWidth={350} />
          <App />
        </MantineProvider>
      </LoaderProvider>
    </BrowserRouter>,
  // </React.StrictMode>
);
