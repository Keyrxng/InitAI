import { Type, Static } from '@sinclair/typebox'

/**
 * This is for structuring the intended cli config for the project setup
 * @param packageManager - What package manager is being used (e.g yarn, npm, pnpm)
 * @param installDir - What directory the packages will be installed into
 * @param installCommand - What command is used to install the packages (e.g yarn add)
 * @param installArgs - What arguments are used to install the packages (e.g yarn add --dev)
 * @param installDevCommand - What command is used to install the dev packages (e.g yarn add --dev)
 * @param installDevArgs - What arguments are used to install the dev packages (e.g yarn add --dev)
 * @param projectLanguage - What language is the project written in (e.g javascript, typescript)
 */
const cliConfig = Type.Object({
    packageManager: Type.String(),
    installDir: Type.String(),
    installCommand: Type.String(),
    installArgs: Type.Array(Type.String()),
    installDevCommand: Type.String(),
    installDevArgs: Type.Array(Type.String()),
    projectLanguage: Type.String(),
})

export type CLIConfig = Static<typeof cliConfig>

/**
 * This is for structuring each package and it's dependecies
 * @param name - The name of the package
 * @param version - The version of the package
 * @param description - The description of the package
 * @param keywords - The keywords of the package
 * @param author - The author of the package
 * @param publisher - The publisher of the package
 * @param links - The links of the package
 * @param dependencies - The dependencies of the package
 * @param devDependencies - The devDependencies of the package
 * @param readme - The readme of the package
 */
export const NPMPackage_ = Type.Object({
    name: Type.String(),
    version: Type.String(),
    description: Type.String(),
    keywords: Type.Array(Type.String()),
    author: Type.Optional(Type.String()),
    publisher: Type.String(),
    links: Type.Object({
        npm: Type.String(),
        homepage: Type.String(),
        repository: Type.String(),
        bugs: Type.String(),
    }),
    dependencies: Type.Array(Type.String()),
    devDependencies: Type.Array(Type.String()),
    readme: Type.String(),
})

export type NPMPackage = Static<typeof NPMPackage_>

/**
 * This is for structuring each file and it's content
 * @param path - The path for the content to be written to (e.g ./src/index.js || .prettierrc || .gitignore)
 * @param content - The content to be written to the path
 * @param language - The language of the content (e.g javascript, typescript, json)
 */
const file = Type.Object({
    path: Type.String(),
    content: Type.String(),
    language: Type.String(),
})

/**
 * This is for structuring the intended setup config for each input package and it's dependecies
 * @param files - What files need to be created
 * @param ignore - What files need to be ignored
 */
const setupFilesConfig = Type.Object({
    files: Type.Array(file),
    ignore: Type.Optional(Type.Array(Type.String())),
})

/**
 * @notice - This is a generic package config so we can force any npm package into the same shape despite it's setup config
 * @param commands - What commands that need to be run once the package is installed (e.g yarn xx --init)
 * @param newFilesNeeded - What files need to be created and what files need to be ignored (e.g OS specific files)
 */
export const genericPackageConfig = Type.Object({
    commands: Type.Optional(Type.Array(Type.String())),
    newFilesNeeded: setupFilesConfig,
    steps: Type.Optional(Type.Array(Type.String())),
    thingsToNote: Type.Optional(Type.Array(Type.String())),
})

export type GenericPackageConfig = Static<typeof genericPackageConfig>

/**
 * This is for structuring the intended project setup object for each input package and it's dependecies
 * @param packages - What packages need to be installed
 * @param commands - What commands that need to be run once all packages are installed (bundled into one command and can be run individually)
 * @param newFilesNeeded - What files need to be created and what files need to be ignored (e.g package A --init creates a file that is already built into plugin B, so no file is needed)
 */
const projectConfig = Type.Object({
    packages: Type.Array(Type.String()),
    commands: Type.Optional(Type.Array(Type.String())),
    newFilesNeeded: setupFilesConfig,
})

export type ProjectConfig = Static<typeof projectConfig>
