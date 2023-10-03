| Step | Instructions |
| ---- | ------------ |
| 1.   | npm/yarn install tailwindcss |
| 2.   | npm/yarn tailwindcss init |
| 3.   | Create a tailwind.config.js file in your project root with the following content: |
```
module.exports = {
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
```