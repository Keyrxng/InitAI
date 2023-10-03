import * as dotenv from 'dotenv'
import { OpenAI } from 'langchain/llms/openai'
import { NPMPackage } from '../types/types'
import { ExtractInstructionsPrompt } from '../utils/promptUtils'

dotenv.config()

class AIBootstrap {
    private llm: OpenAI
    private llmKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY

    constructor() {
        this.llm = new OpenAI({
            openAIApiKey: this.llmKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
        })
    }

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

    async extract(packageName: string): Promise<string | undefined> {
        const npmPackage = await this.fetchPackage(packageName)
        const instructions = await this.extractInstructions(npmPackage)
        return instructions
    }

    async extractInstructions(
        npmPackage: NPMPackage
    ): Promise<string | undefined> {
        const readme = npmPackage.readme
        const prompt = await ExtractInstructionsPrompt.format({
            packageName: npmPackage.name,
            readme: readme,
        })

        const startTime = Date.now()
        const llmCompletion = await this.llm.predict(prompt)
        const endTime = Date.now()

        console.log(`Time taken: ${endTime - startTime}ms`)
        console.log(llmCompletion)

        return llmCompletion
    }
}

export { AIBootstrap }
