/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import path from 'path'

function formatFilename(filename: string): string {
    filename = filename
        .replace(/[<>:"/\\|?*]+/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 50)
    const randoomID = Math.random().toString(36).substring(2, 7)

    filename = `${filename}-${randoomID}`
    return filename
}

export function writeJsonToFile(filename: string, data: any): void {
    const formattedFilename = formatFilename(filename)
    const filepath = path.resolve(
        __dirname,
        `../../data/${formattedFilename}.json`
    )

    if (!data) throw new Error('No data to write')

    fs.writeFile(filepath, data, (err) => {
        if (err) throw err
        console.log(`Data written to ${filename}`)
    })
}

export function writeMdToFile(filename: string, data: any): void {
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
