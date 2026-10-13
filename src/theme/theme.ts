import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";

// Handwritten font for headings only; body text stays in the default font for readability.
const handwriting = "'Patrick Hand', 'Comic Sans MS', cursive";

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: palette,
  typography: {
    h3: { fontFamily: handwriting },
    h4: { fontFamily: handwriting },
    h6: { fontFamily: handwriting, fontSize: "1.4rem" },
  },
});
