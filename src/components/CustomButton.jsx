import Button from "@mui/joy/Button";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";

const themeBlue = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#0047AB",
          color: "white",
          "&:hover": {
            backgroundColor: "rgb(0, 53, 128)",
          },
          height: "44px",
          ":disabled": {
            backgroundColor: "#FFFFFF1F",
            color: "#A4A7AE",
            border: "1px solid #A4A7AE",
          },
        },
      },
    },
  },
});

const themeOutline = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#414651",
          border: "1px solid #D5D7DA",
          height: "44px",
        },
      },
    },
  },
});

const themeOutlineBlue = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0047AB",
          border: "1px solid #0047AB",
          height: "44px",
        },
      },
    },
  },
});

function CustomButton(props) {
  return (
    <>
      {props.variant === "outlined" ? (
        <>
          <CssVarsProvider theme={themeOutline}>
            <Button {...props}>{props.children}</Button>
          </CssVarsProvider>
        </>
      ) : props.variant === "outlined-blue" ? (
        <>
          <CssVarsProvider theme={themeOutlineBlue}>
            <Button {...props}>{props.children}</Button>
          </CssVarsProvider>
        </>
      ) : (
        <>
          <CssVarsProvider theme={themeBlue}>
            <Button {...props}>{props.children}</Button>
          </CssVarsProvider>
        </>
      )}
    </>
  );
}

export default CustomButton;
