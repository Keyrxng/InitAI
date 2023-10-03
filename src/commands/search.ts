import { Command, command, metadata, param } from 'clime'
import { AIBootstrap } from '../classes/classes'

@command({
    brief: 'Search for a package',
    description:
        'Fetches and displays information about a specific npm package',
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
        const packageData = await aiBootstrap.extract(packageName)

        if (packageData) {
            console.log('Package found')
            console.log(packageData)
        } else {
            console.error('Package not found or an error occurred')
        }
    }
}
