| Step | Instructions |
| ---- | ------------ |
| 1.   | npm install inquirer |
| 2.   | var inquirer = require('inquirer'); |
| 3.   | inquirer.prompt([/* Pass your questions in here */]) |
| 4.   | .then((answers) => { // Use user feedback for... whatever!! }) |
| 5.   | .catch((error) => { if (error.isTtyError) { // Prompt couldn't be rendered in the current environment } else { // Something else went wrong } }); |
