import { Command, command, metadata, param } from 'clime'
import {
    BootstrapAgent,
    ExtractionTool,
    FileWriteTool,
    PackageTool,
} from '../classes/classes'
import { writeJsonToFile } from '../utils/writeToFile'

@command({
    brief: 'Extract the installation instructions for a package using AI agents.',
    description:
        'Extracts the installation instructions for a package from the package readme',
})
export default class extends Command {
    @metadata
    async execute(
        @param({
            required: true,
            description:
                'The name of the packages comma separated (clime,openai,typescript)',
        })
        packageNames: string,

        @param({
            required: true,
            description:
                'Project type (e.g., node, react, next, ts, js, py etc.)',
        })
        projectType: string
    ) {
        console.log('Extracting instructions...')
        const aiBootstrap = new BootstrapAgent([
            new PackageTool(),
            new FileWriteTool(),
            new ExtractionTool(),
        ])
        const packageNamesArray = packageNames.split(',')

        const instructions = await aiBootstrap.agentExtract(
            packageNamesArray,
            projectType
        )

        if (instructions) {
            console.log('Instructions extracted')
            console.log(instructions)
            writeJsonToFile(
                `${Date.now().toLocaleString()}-setup-steps`,
                JSON.stringify(instructions)
            )
        } else {
            console.error('Instructions not extracted or an error occurred')
        }
    }
}
