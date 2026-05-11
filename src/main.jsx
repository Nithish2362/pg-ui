import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { MantineProvider, createTheme, rem } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css"
import { BrowserRouter } from "react-router-dom";
import 'material-symbols';
import { Notifications } from "@mantine/notifications";
import { LoaderProvider } from "./common/LoaderContext";

const theme = createTheme({
  primaryColor: 'dark',
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  headings: { fontFamily: "'Outfit', sans-serif", fontWeight: '800' },
  defaultRadius: 'md',
  colors: {
    dark: [
      '#f5f5f5',
      '#e0e0e0',
      '#bdbdbd',
      '#9e9e9e',
      '#757575',
      '#616161',
      '#424242',
      '#212121',
      '#1a1a1a',
      '#000000',
    ],
    brand: [
      '#fdf8f0',
      '#f5edda',
      '#ebd8b5',
      '#dfc18a',
      '#d4ab65',
      '#c5a059',
      '#b38e4a',
      '#9a7a3d',
      '#7d6330',
      '#5e4a22',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          fontSize: rem(12),
          transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
        },
      }),
    },
    Modal: {
      defaultProps: {
        zIndex: 10000,
        radius: 'xl',
        centered: true,
      },
      styles: () => ({
        title: {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: rem(20),
        },
        content: {
          borderRadius: rem(24),
        },
        header: {
          borderBottom: '1px solid #f5f5f5',
          paddingBottom: rem(16),
          marginBottom: rem(4),
        },
      }),
    },
    Drawer: {
      defaultProps: {
        zIndex: 10000,
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
      styles: () => ({
        input: {
          height: rem(40),
          minHeight: rem(40),
          borderColor: '#ebebeb',
          fontSize: rem(14),
          transition: 'all 0.3s ease',
          '&:focus': {
            borderColor: '#c5a059',
            boxShadow: '0 0 0 3px rgba(197,160,89,0.08)',
          },
        },
        label: {
          fontWeight: 700,
          fontSize: rem(11),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#888',
          marginBottom: rem(6),
        },
      }),
    },
    Select: {
      defaultProps: { radius: 'md' },
      styles: () => ({
        input: {
          height: rem(40),
          minHeight: rem(40),
          borderColor: '#ebebeb',
          fontSize: rem(14),
          transition: 'all 0.3s ease',
        },
        label: {
          fontWeight: 700,
          fontSize: rem(11),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#888',
          marginBottom: rem(6),
        },
        dropdown: {
          borderRadius: rem(12),
          border: '1px solid #f0f0f0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        },
      }),
    },
    NumberInput: {
      defaultProps: { radius: 'md' },
      styles: () => ({
        input: {
          height: rem(40),
          minHeight: rem(40),
          borderColor: '#ebebeb',
          fontSize: rem(14),
        },
        label: {
          fontWeight: 700,
          fontSize: rem(11),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#888',
          marginBottom: rem(6),
        },
      }),
    },
    Textarea: {
      defaultProps: { radius: 'md' },
      styles: () => ({
        input: {
          borderColor: '#ebebeb',
          fontSize: rem(14),
          transition: 'all 0.3s ease',
        },
        label: {
          fontWeight: 700,
          fontSize: rem(11),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#888',
          marginBottom: rem(6),
        },
      }),
    },
    Card: {
      defaultProps: { radius: 'lg' },
      styles: () => ({
        root: {
          transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
        },
      }),
    },
    Paper: {
      defaultProps: { radius: 'lg' },
    },
    Badge: {
      defaultProps: { radius: 'sm' },
      styles: () => ({
        root: {
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontSize: rem(10),
        },
      }),
    },
    Tabs: {
      styles: () => ({
        tab: {
          fontWeight: 700,
          fontSize: rem(13),
          letterSpacing: '0.02em',
          transition: 'all 0.3s ease',
        },
        tabLabel: {
          textTransform: 'uppercase',
          fontSize: rem(11),
          letterSpacing: '0.06em',
        },
      }),
    },
    ActionIcon: {
      styles: () => ({
        root: {
          transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        },
      }),
    },
    Divider: {
      styles: () => ({
        root: {
          borderColor: '#f0f0f0',
        },
      }),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <LoaderProvider>
        <MantineProvider theme={theme}>
          <Notifications position="top-right" containerWidth={350} zIndex={10000} />
          <App />
        </MantineProvider>
      </LoaderProvider>
    </BrowserRouter>,
);
