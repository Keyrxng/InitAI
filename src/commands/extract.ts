import { Command, command, metadata, param } from 'clime'
import { AIBootstrap } from '../classes/classes'
import { writeToFile } from '../utils/writeToFile'

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
            description: 'The name of the package',
        })
        packageName: string
    ) {
        const aiBootstrap = new AIBootstrap()

        const instructions = await aiBootstrap.extract(packageName)

        if (instructions) {
            console.log('Instructions extracted')
            console.log(instructions)
            writeToFile(`${packageName}-setup-steps`, instructions)
        } else {
            console.error('Instructions not extracted or an error occurred')
        }
    }
}
