/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv'
import { OpenAI } from 'langchain/llms/openai'
import { NPMPackage } from '../types/types'
import {
    JsonMarkdownStructuredOutputParser,
    StructuredOutputParser,
} from 'langchain/output_parsers'
import { zodGenericPackageConfig } from '../types/zods'
import { RunnableSequence } from 'langchain/schema/runnable'
import { PromptTemplate } from 'langchain/prompts'
import { z } from 'zod'
import {
    ExtractInstructionsPrompt,
    NewExtractPrompt,
    tableExtractPrompt,
} from '../utils/promptUtils'
import { JsonObject, Tool } from 'langchain/tools'
import {
    ChainStepExecutor,
    LLMPlanner,
    PlanAndExecuteAgentExecutor,
} from 'langchain/experimental/plan_and_execute'
import yaml from 'js-yaml'
import * as fs from 'fs'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationSummaryMemory } from 'langchain/memory'
import { CallbackManagerForToolRun } from 'langchain/dist/callbacks'
dotenv.config()

class PackageTool extends Tool {
    protected async _call(
        arg: any,
        _runManager?: CallbackManagerForToolRun | undefined
    ): Promise<string> {
        const packages = await this.fetchPackages(arg)
        return JSON.stringify(packages)
    }
    name: string = 'PackageTool'
    description: string =
        'Fetches package data from NPM registry (args: packageNames: string){e.g. "react,react-dom"}'
    async fetchPackage(packageName: string): Promise<NPMPackage> {
        const npmRes = await fetch(
            `https://api.npms.io/v2/package/${packageName}`
        )
        const res = await npmRes.json()

        const npmPackage: NPMPackage = {
            name: res.collected.metadata.name,
            version: res.collected.metadata.version,
            description: res.collected.metadata.description,
            keywords: res.collected.metadata.keywords,
            author: res.collected.metadata.author?.name,
            publisher: res.collected.metadata.publisher.username,
            links: {
                npm: res.collected.metadata.links.npm,
                homepage: res.collected.metadata.links.homepage,
                repository: res.collected.metadata.links.repository,
                bugs: res.collected.metadata.links.bugs,
            },
            dependencies: res.collected.metadata.dependencies,
            devDependencies: res.collected.metadata.devDependencies,
            readme: res.collected.metadata.readme,
        }

        return npmPackage
    }

    async fetchPackages(packageNames: string[]): Promise<NPMPackage[]> {
        const packages: NPMPackage[] = []
        for (const packageName of packageNames) {
            const npmPackage = await this.fetchPackage(packageName)
            packages.push(npmPackage)
        }
        return packages
    }
}

class FileWriteTool extends Tool {
    name: string = 'FileWriteTool'
    description: string = 'Writes a file to the project directory'
    protected _call(
        arg: any,
        _runManager?: CallbackManagerForToolRun | undefined
    ): Promise<string> {
        const file = JSON.parse(arg)
        const path = process.cwd() + '../..docs/'

        console.log('====================PATH====================')
        console.log(path)
        console.log('====================PATH====================')
        fs.writeFileSync(process.cwd(), file.content)
        return Promise.resolve('File written successfully')
    }
}

class ExtractionTool extends Tool {
    name: string = 'ExtractionTool'
    description: string =
        'Extracts instructions from a package json object (arg: package: NPMPackage)'
    llm: OpenAI
    private llmKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY

    constructor() {
        super()
        this.llm = new OpenAI({
            openAIApiKey: this.llmKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
            temperature: 0,
        })
    }
    protected async _call(
        arg: NPMPackage,
        _runManager?: CallbackManagerForToolRun | undefined
    ): Promise<string> {
        if (!arg) return Promise.resolve('No package provided')
        const prompt = await NewExtractPrompt.format({
            packageName: arg.name,
            content: arg,
        })

        const llmCompletion = await this.llm.predict(prompt)

        const jsonOutputParser = StructuredOutputParser.fromZodSchema(
            z.object({
                package: z
                    .string()
                    .describe(
                        `NPM Package: ${arg.name} and the pragmatic steps to install and use it.`
                    ),
                zodSchema: zodGenericPackageConfig,
            })
        )

        const markdownOutputParser =
            JsonMarkdownStructuredOutputParser.fromZodSchema(
                z.object({
                    package: z
                        .string()
                        .describe(
                            `NPM Package: ${arg.name} and the pragmatic steps to install and use it.`
                        ),
                    zodSchema: zodGenericPackageConfig,
                })
            )

        const jsonChain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                'Complete the task exactly as described.\n{format_instructions}\n{readme}'
            ),
            new OpenAI({ temperature: 0.3, modelName: 'gpt-3.5-turbo-16k' }),
            jsonOutputParser,
        ])

        const mdChain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                'Complete the task exactly as described.\n{format_instructions}\n{readme}'
            ),
            new OpenAI({ temperature: 0.3, modelName: 'gpt-3.5-turbo-16k' }),
            markdownOutputParser,
        ])

        let response
        try {
            response = await mdChain.withRetry().invoke({
                format_instructions:
                    markdownOutputParser.getFormatInstructions(),
                readme: llmCompletion,
            })
        } catch (err) {
            console.log(markdownOutputParser.getFormatInstructions())
            console.log(err)
        }
        let res
        try {
            res = await jsonChain.invoke({
                format_instructions: jsonOutputParser.getFormatInstructions(),
                readme: llmCompletion,
            })
        } catch (err) {
            console.log(jsonOutputParser.getFormatInstructions())
            console.log(err)
        }

        return JSON.stringify({ response, res })
    }
}

class BootstrapAgent extends PlanAndExecuteAgentExecutor {
    tools: [
        packageTool: PackageTool,
        fileWriteTool: FileWriteTool,
        extractionTool: ExtractionTool,
    ]
    defaultPlanner: LLMPlanner
    defaultStepExecutor: ChainStepExecutor
    llm: OpenAI
    llmKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY
    private openAIApi: JsonObject

    executor: PlanAndExecuteAgentExecutor
    memory: ConversationSummaryMemory
    chatModel: ChatOpenAI

    constructor(tools: [PackageTool, FileWriteTool, ExtractionTool]) {
        super({
            planner: PlanAndExecuteAgentExecutor.getDefaultPlanner({
                llm: tools[2].llm,
            }),
            stepExecutor: PlanAndExecuteAgentExecutor.getDefaultStepExecutor({
                llm: tools[2].llm,
                tools: [tools[0], tools[1], tools[2]],
            }),
        })
        this.llm = new OpenAI({
            openAIApiKey: this.llmKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
            temperature: 0,
        })
        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.llmKey,
            modelName: 'gpt-3.5-turbo-16k',
            verbose: true,
            maxTokens: -1,
        })
        this.memory = new ConversationSummaryMemory({
            memoryKey: 'chat_history',
            llm: this.chatModel,
        })
        try {
            const yamlFile = fs.readFileSync(
                process.cwd() + '/src/classes/openApi.yaml',
                'utf8'
            )
            this.openAIApi = yaml.load(yamlFile) as JsonObject
            if (!this.openAIApi) {
                throw new Error('Failed to load OpenAPI spec')
            }
        } catch (e) {
            console.error(e)
            return
        }
    }

    async plan(input: {
        packageNames: string[]
        projectType: string
    }): Promise<void> {
        const { packageNames, projectType } = input
        const packages = await this.tools[0].fetchPackages(packageNames)
        const prompt = await ExtractInstructionsPrompt.format({
            packageNames: packages.map((pack) => pack.name).join(','),
            projectType: projectType,
        })
        await this.execute(prompt)
    }

    async execute(prompt: string): Promise<void> {
        await this.executor.call({ prompt })
    }

    async agentExtract(packageNames: string[], projectType: string) {
        const packages = await this.tools[0].fetchPackages(packageNames)

        const instructions = await this.agentExtractInstructions(
            packages,
            projectType
        )

        return instructions
    }

    async agentExtractInstructions(
        npmPackage: NPMPackage[],
        projectType: string
    ) {
        try {
            const prompt = await ExtractInstructionsPrompt.format({
                packageNames: npmPackage.map((pack) => pack.name).join(','),
                projectType: projectType,
            })
            const llmCompletion = await this.llm.predict(prompt)

            const jsonOutputParser = StructuredOutputParser.fromZodSchema(
                z.object({
                    package: z
                        .string()
                        .describe(
                            `NPM Package: ${npmPackage.map(
                                (pack) => pack.name
                            )} and the pragmatic steps to install and use it.`
                        ),
                    zodSchema: zodGenericPackageConfig,
                })
            )

            const markdownOutputParser =
                JsonMarkdownStructuredOutputParser.fromZodSchema(
                    z.object({
                        package: z
                            .string()
                            .describe(
                                `NPM Package: ${npmPackage.map(
                                    (pack) => pack.name
                                )} and the pragmatic steps to install and use it.`
                            ),
                        zodSchema: zodGenericPackageConfig,
                    })
                )

            const jsonChain = RunnableSequence.from([
                PromptTemplate.fromTemplate(
                    'Complete the task exactly as described.\n{format_instructions}\n{readme}'
                ),
                new OpenAI({
                    temperature: 0.3,
                    modelName: 'gpt-3.5-turbo-16k',
                }),
                jsonOutputParser,
            ])

            const mdChain = RunnableSequence.from([
                PromptTemplate.fromTemplate(
                    'Complete the task exactly as described.\n{format_instructions}\n{readme}'
                ),
                new OpenAI({
                    temperature: 0.3,
                    modelName: 'gpt-3.5-turbo-16k',
                }),
                markdownOutputParser,
            ])

            let response
            try {
                response = await mdChain.withRetry().invoke({
                    format_instructions:
                        markdownOutputParser.getFormatInstructions(),
                    readme: llmCompletion,
                })
            } catch (err) {
                console.log(markdownOutputParser.getFormatInstructions())
                console.log(err)
            }
            let res
            try {
                res = await jsonChain.invoke({
                    format_instructions:
                        jsonOutputParser.getFormatInstructions(),
                    readme: llmCompletion,
                })
            } catch (err) {
                console.log(jsonOutputParser.getFormatInstructions())
                console.log(err)
            }

            return { response, res }
        } catch (error) {
            console.error('Error in agentExtractInstructions:', error)
            throw error
        }
    }
}

class AIBootstrap {
    llm: OpenAI
    tools: [PackageTool, FileWriteTool, ExtractionTool]
    private llmKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY

    constructor() {
        this.llm = new OpenAI({
            openAIApiKey: this.llmKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
            temperature: 0,
        })
        this.tools = [
            new PackageTool(),
            new FileWriteTool(),
            new ExtractionTool(),
        ]
    }

    async extract(packageName: string) {
        const npmPackage = await this.tools[0].fetchPackage(packageName)
        const instructions = await this.extractInstructions(npmPackage)
        return instructions
    }

    async extractInstructions(npmPackage: NPMPackage) {
        let readme = npmPackage.readme
        if (!readme) readme = npmPackage.description

        const prompt = await tableExtractPrompt.format({
            readme: readme,
        })

        const llmCompletion = await this.llm.predict(prompt)

        const jsonOutputParser = StructuredOutputParser.fromZodSchema(
            z.object({
                package: z
                    .string()
                    .describe(
                        `NPM Package: ${npmPackage.name} and the pragmatic steps to install and use it.`
                    ),
                zodSchema: zodGenericPackageConfig,
            })
        )

        const markdownOutputParser =
            JsonMarkdownStructuredOutputParser.fromZodSchema(
                z.object({
                    package: z
                        .string()
                        .describe(
                            `NPM Package: ${npmPackage.name} and the pragmatic steps to install and use it.`
                        ),
                    zodSchema: zodGenericPackageConfig,
                })
            )

        const jsonChain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                'Complete the task exactly as described.\n{format_instructions}\n{readme}'
            ),
            new OpenAI({ temperature: 0.3, modelName: 'gpt-3.5-turbo-16k' }),
            jsonOutputParser,
        ])

        const mdChain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                'Complete the task exactly as described.\n{format_instructions}\n{readme}'
            ),
            new OpenAI({ temperature: 0.3, modelName: 'gpt-3.5-turbo-16k' }),
            markdownOutputParser,
        ])

        let response
        try {
            response = await mdChain.withRetry().invoke({
                format_instructions:
                    markdownOutputParser.getFormatInstructions(),
                readme: llmCompletion,
            })
        } catch (err) {
            console.log(markdownOutputParser.getFormatInstructions())
            console.log(err)
        }
        let res
        try {
            res = await jsonChain.invoke({
                format_instructions: jsonOutputParser.getFormatInstructions(),
                readme: llmCompletion,
            })
        } catch (err) {
            console.log(jsonOutputParser.getFormatInstructions())
            console.log(err)
        }

        return { response, res }
    }

    async extractMany(packageNames: string) {
        const instructions = []
        const names = packageNames.split(',')
        for (const npmPackage of names) {
            const instruction = await this.extract(npmPackage)
            instructions.push(instruction)
        }

        return instructions
    }
}

const noop = () => {
    console.log(BootstrapAgent)
    console.log(noop)
}

export {
    AIBootstrap,
    BootstrapAgent,
    PackageTool,
    FileWriteTool,
    ExtractionTool,
}
