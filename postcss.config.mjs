/**
 * Project-local PostCSS config. Empty plugin list on purpose — the site uses
 * plain CSS. This overrides a stray postcss.config.mjs found in ancestor
 * directories (e.g. the user home folder) that references Tailwind.
 */
const config = {
  plugins: {},
};

export default config;
