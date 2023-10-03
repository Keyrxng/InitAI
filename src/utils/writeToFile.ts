/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import path from 'path'

function formatFilename(filename: string): string {
    filename = filename.replace(/[<>:"/\\|?*]+/g, '')
    filename = filename.replace(/\s+/g, '-')
    filename = filename.toLowerCase()
    filename = filename.substring(0, 50)
    return filename
}

export function writeToFile(filename: string, data: any): void {
    const formattedFilename = formatFilename(filename)
    const filepath = path.resolve(
        __dirname,
        `../../data/${formattedFilename}.md`
    )

    if (!data) throw new Error('No data to write')

    fs.writeFile(filepath, data, (err) => {
        if (err) throw err
        console.log(`Data written to ${filename}`)
    })
}
