import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Router from "./views/Router/Router";
import { Provider } from "react-redux";
import store from "./helpers/redux/store";
import { SnackbarProvider } from "notistack";

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
    >
      <Provider store={store}>
        <Router />
      </Provider>
    </SnackbarProvider>
  </StrictMode>
);
