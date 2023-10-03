# InitAI CLI Tool

InitAI is a CLI tool designed to streamline the process of setting up new projects with various npm packages. The tool fetches package information from the npm registry, extracts installation instructions from package readmes using an AI model. Currently instructions are only output as md tables, but in the future the tool will be able to automatically generate setup scripts and run them to install packages, create config files, etc.

## Classes

### AIBootstrap

AIBootstrap is the main class that handles interaction with the npm registry and the AI model for extracting setup instructions.

- Constructor: Initializes the AI model.
- fetchPackage(packageName: string): Fetches data for a single npm package.
- fetchPackages(packageNames: string[]): Fetches data for multiple npm packages.
- extract(packageName: string): Extracts setup instructions for a specified npm package.
- extractInstructions(npmPackage: NPMPackage): Uses the AI model to extract setup instructions from a package's readme.

## Types

### NPMPackage

The NPMPackage type defines the structure of the npm package data.

- name: Package name.
- version: Package version.
- description: Package description.
- ... other fields

## Commands

### Extract Command

Extracts the installation instructions for a specified npm package.

Usage:
'npm bootstrap extract <package-name>'

### Search Command

Fetches and displays information about a specified npm package.

Usage:
'npm bootstrap search <package-name>'

## Utilities

### writeToFile

A utility function to write data to a file.