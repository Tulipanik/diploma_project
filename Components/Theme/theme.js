import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#33a095",
      main: "#005f56",
      dark: "#005f56",
      contrastText: "#fff",
    },
    secondary: {
      light: "#df487f",
      main: "#d81b60",
      dark: "#971243",
      contrastText: "#000",
    },
  },
});

export default theme;
