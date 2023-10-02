// import { OpenAI } from 'langchain/llms/openai'
import * as dotenv from 'dotenv'

dotenv.config()

class AIBootstrap {
    async fetchPackage(packageName: string) {
        const npmRes = await fetch(
            `https://api.npms.io/v2/package/${packageName}`
        )
        const npmResJson = await npmRes.json()
        return npmResJson
    }
}

export { AIBootstrap }
