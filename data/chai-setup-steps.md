| Step | Instructions |
| ---- | ------------ |
| 1.   | npm install --save-dev chai |
| 2.   | If using in Node.js, import the library in your code: ```js var chai = require('chai');```<br>If using in the browser, include the `chai.js` file in your HTML: ```html <script src="./node_modules/chai/chai.js"></script>``` |
| 3.   | Choose one of the available styles: ```js var assert = chai.assert;``` or ```js var expect = chai.expect;``` or ```js var should = chai.should();``` |
| 4.   | Optionally, you can also use pre-native modules usage with local variables: ```js const { assert } = require('chai');``` or ```js const { expect } = require('chai');``` or ```js const { should } = require('chai');``` |
| 5.   | If using native modules, import the desired style: ```js import 'chai/register-assert';``` or ```js import 'chai/register-expect';``` or ```js import 'chai/register-should';``` |
| 6.   | Import specific styles as local variables: ```js import { assert } from 'chai';``` or ```js import { expect } from 'chai';``` or ```js import { should } from 'chai';``` |
| 7.   | Usage with Mocha: ```bash mocha spec.js -r chai/register-assert``` or ```bash mocha spec.js -r chai/register-expect``` or ```bash mocha spec.js -r chai/register-should```