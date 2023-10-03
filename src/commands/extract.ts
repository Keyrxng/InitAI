import { Command, command, metadata, param } from 'clime'
import { AIBootstrap } from '../classes/classes'
import { writeJsonToFile } from '../utils/writeToFile'

@command({
    brief: 'Extract the installation instructions for a package',
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
        packageNames: string
    ) {
        const aiBootstrap = new AIBootstrap()

        const instructions = await aiBootstrap.extractMany(packageNames)
        const name = instructions.map((i) => i.response?.package)

        if (instructions) {
            console.log('Instructions extracted')
            console.log(instructions)
            writeJsonToFile(`${name}-setup-steps`, JSON.stringify(instructions))
        } else {
            console.error('Instructions not extracted or an error occurred')
        }
    }
}
