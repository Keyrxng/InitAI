import { z } from 'zod'

export const zodNPMPackage = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    author: z.string().optional(),
    publisher: z.string(),
    links: z.object({
        npm: z.string(),
        homepage: z.string(),
        repository: z.string(),
        bugs: z.string(),
    }),
    dependencies: z.array(z.string()),
    devDependencies: z.array(z.string()),
    readme: z.string(),
})

export const zodFile = z.object({
    path: z.string().optional(),
    content: z.string().optional(),
    language: z.string().optional(),
})

export const zodSetupFilesConfig = z.object({
    files: z.array(zodFile).optional(),
    ignore: z.array(z.string()).optional(),
})

export const zodGenericPackageConfig = z.object({
    newFilesNeeded: zodSetupFilesConfig,
    installSteps: z.array(z.string()).optional(),
    usageSteps: z.array(z.string()).optional(),
    CommonJSorESModule: z.string().optional(),
    thingsToNote: z.array(z.string()).optional(),
})

export const zodProjectConfig = z.object({
    packages: z.array(z.string()),
    commands: z.array(z.string()).optional(),
    newFilesNeeded: zodSetupFilesConfig,
})
