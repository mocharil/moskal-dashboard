import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Router from "./views/Router/Router";
import { Provider } from "react-redux";
import store from "./helpers/redux/store";
import { SnackbarProvider } from "notistack";
import CustomSnackbar from "./components/CustomSnackbar";

import "./main.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={3000}
      Components={{
        success: CustomSnackbar,
        error: CustomSnackbar,
        warning: CustomSnackbar,
        info: CustomSnackbar,
        default: CustomSnackbar,
      }}
      TransitionProps={{
        direction: "down",
      }}
    >
      <Provider store={store}>
        <Router />
      </Provider>
    </SnackbarProvider>
  </StrictMode>
);
