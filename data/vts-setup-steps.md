| Step | Instructions |
| ---- | ------------ |
| 1.   | yarn add vts --dev |
| 2.   | Update tslint.json to use `"extends": "vts/tslint"` or `"extends": "vts/tslint-prettier"` |
| 3.   | Create prettier.config.js and set it to `module.exports = require('vts/prettier');` |