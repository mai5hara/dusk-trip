import globals from "globals";
import baseConfig from "./base.mjs";

/** Base config plus Node.js globals. */
export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
