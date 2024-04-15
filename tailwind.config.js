const { default: daisyui } = require("daisyui");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}",],
  theme: {
    extend: {
      spacing: {
        '104': '26rem',
        '128': '32rem',
        '132': '33rem',
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        action: 'var(--color-action)',
        info: 'var(--color-info)',
        danger: 'var(--color-danger)'
      },
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["light"],
  }
}
