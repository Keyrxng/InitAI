/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromptTemplate } from 'langchain/prompts'

const instructionsTemplate = `
| Step | Instructions |
| ---- | ------------ |
| 1.   | npm/yarn install <package(s)>|
| 2.   | npm/yarn <package(s)> init |
| 3.   | Create config.yaml "...instructions" |
`

export const ExtractInstructionsPrompt = PromptTemplate.fromTemplate(
    `
You are being called to extract the instructions from a package's readme, the package is called {packageName}.
You are extracting the install and setup instructions from the readme as part of a larger process of bootstrapping a project from a CLI with multiple arbitrary packages.
Focus specifically on the install and setup instructions, and ignore the rest of the readme.
The install and setup instructions should be extracted as a unified set of instructions, and should be in a format that is easy to follow like the one below:

${instructionsTemplate}

The instructions should be extracted from the following readme:
{readme}
`
)

export const ProjectSetupDocsPrompt = PromptTemplate.fromTemplate(
    `
You are being called to create a set of project setup docs for a project, you are to assume that everything has already been setup and you are just documenting the process.
The project is called {projectName}, and it is a {projectType} project.
The project has the following packages installed: 

| Package Name | Setup Instructions |
| {packageNames} | {instructions} |
`
)
