/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromptTemplate } from 'langchain/prompts'

export const ExtractInstructionsPrompt = PromptTemplate.fromTemplate(`
    Use any of these tools to complete the task:
    - FetchPackagesTool: This tool is used to fetch the packages from the npm registry
    - FetchPackageTool: This tool is used to fetch a single package from the npm registry
    - WriteFileTool: This tool is used to write a file to the file system
    - ExtractInstructionsTool: This tool is used to extract the instructions from the package readme

    You have been summoned by a Command Line Interface (CLI) tool designed to automate the bootstrapping of a new project with specific packages.
    You are the first agent in the chain and your task is to gather the setup and usage instructions for the packages respecting the schema below.
    Focus on the readme for each package and extract the setup and usage instructions for each package.
    Avoid any information that is not directly related to the setup or usage of the package, such as contributors etc, try to keep it short and conscise.

    # Project Type: 
    - {projectType}

    # Packages to be Installed: 
    - {packageNames}
    
    Schema:
    - File: 
        - Path: The location where the new file needs to be created.
        - Content: The content to be written to the new file.
        - Language: The programming language or format of the file (e.g., JSON, YAML).

    - Files:
        - To Create: A list of files that need to be created.
        - To Ignore: A list of files that should be ignored (optional).

    - Commands: 
        - A list of commands to be executed post package installation (optional).

    - Installation Steps: 
        - A sequence of steps required for installing the package (optional).

    - Usage Steps: 
        - A sequence of steps detailing how to use the package (optional).

    - Module System: 
        - Specify whether the package uses CommonJS or ES Module (optional).

    - Noteworthy Points: 
        - Additional information such as OS specifics, usage caveats, etc. (optional).
`)

export const tableExtractPrompt = PromptTemplate.fromTemplate(`
You have been summoned by a Command Line Interface (CLI) tool designed to automate the bootstrapping of a new project with specific packages.
You are to extract the setup and usage instructions for the packages respecting the schema below.
Focus on the readme for each package and extract the setup and usage instructions for each package.
Avoid any information that is not directly related to the setup or usage of the package, such as contributors etc, try to keep it short and conscise.
Your response should be a well formatted markdown making use of columns, tables etc while avoiding code blocks, block quotes and all backticks which should be substitued for apostrophes instead.

Schema:
- File: 
    - Path: The location where the new file needs to be created.
    - Content: The content to be written to the new file.
    - Language: The programming language or format of the file (e.g., JSON, YAML).

- Files:
    - To Create: A list of files that need to be created.
    - To Ignore: A list of files that should be ignored (optional).

- Commands: 
    - A list of commands to be executed post package installation (optional).

- Installation Steps: 
    - A sequence of steps required for installing the package (optional).

- Usage Steps: 
    - A sequence of steps detailing how to use the package (optional).

- Module System: 
    - Specify whether the package uses CommonJS or ES Module (optional).

- Noteworthy Points: 
    - Additional information such as OS specifics, usage caveats, etc. (optional).

# README #

{readme}
`)

export const NewExtractPrompt = PromptTemplate.fromTemplate(`
You are being called as part of a CLI tool to automate the process of bootstrapping a new project with a set of packages.

Use any of these tools to complete the task:
- FetchPackagesTool: This tool is used to fetch the packages from the npm registry
- FetchPackageTool: This tool is used to fetch a single package from the npm registry
- WriteFileTool: This tool is used to write a file to the file system
- ExtractInstructionsTool: This tool is used to extract the instructions from the package readme

SCHEMA:
- File: z.object(path: z.string(),content: z.string(),language: z.string()) // This is for structuring each new needed file's content, language refers to the new file (E.G .prettierrc or .yaml or json)
- Files: z.array(zodFile), ignore: z.array(z.string()).optional(),) // This is for listing all the files that need to be created and ignored
- Commands: z.array(z.string()).optional(), // This is for all the commands that need to be run once the package is installed (e.g yarn xx --init)
- NewFilesNeeded: Files, // This is for all the files that need to be created and ignored
- installSteps: z.array(z.string()).optional(), // This is for all the steps that need to be taken to install the package
- usageSteps: z.array(z.string()).optional(), // This is how to use the package
- CommonJSorESModule: z.string().optional(), // CommonJS or ES Module
- ThingsToNote: z.array(z.string()).optional(), // Things to note like OS specifics, usage, etc

# Package Name:
- {packageName}

# Content:
{content}


`)

export const ProjectSetupDocsPrompt = PromptTemplate.fromTemplate(`
You are being called to create a set of project setup docs for a project, you are to assume that everything has already been setup and you are just documenting the process.
The project is called {projectName}, and it is a {projectType} project.
The project has the following packages installed: 

| Package Name | Setup Instructions |
| {packageNames} | {instructions} |
`)

// export const ExtractInstructionsPrompt =
//     PromptTemplate.fromTemplate(`You are being called as part of a CLI tool to automate the process of bootstrapping a new project with a set of packages.
// The packages are: {packageNames}
// The project is called {projectName}
// The project is a {projectType} project

// ==========
// Use the following schema to extract the required information from the various package readme's.

// File: z.object(path: z.string(),content: z.string(),language: z.string(),), // This is for structuring each new needed file's content, language refers to the new file (E.G .prettierrc or .yaml or json)
// Files: z.array(zodFile), ignore: z.array(z.string()).optional(),) // This is for listing all the files that need to be created and ignored
// Commands: z.array(z.string()).optional(), // This is for all the commands that need to be run once the package is installed (e.g yarn xx --init)
// NewFilesNeeded: Files, // This is for all the files that need to be created and ignored
// installSteps: z.array(z.string()).optional(), // This is for all the steps that need to be taken to install the package
// usageSteps: z.array(z.string()).optional(), // This is how to use the package
// CommonJSorESModule: z.string().optional(), // CommonJS or ES Module
// ThingsToNote: z.array(z.string()).optional(), // Things to note like OS specifics, usage, etc
// ==========
// `)
