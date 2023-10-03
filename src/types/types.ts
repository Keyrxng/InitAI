import { Type, Static } from '@sinclair/typebox'

const NPMPackage = Type.Object({
    name: Type.String(),
    version: Type.String(),
    description: Type.String(),
    keywords: Type.Array(Type.String()),
    author: Type.Optional(Type.String()),
    publisher: Type.String(),
    links: Type.Object({
        npm: Type.String(),
        homepage: Type.String(),
        repository: Type.String(),
        bugs: Type.String(),
    }),
    dependencies: Type.Array(Type.String()),
    devDependencies: Type.Array(Type.String()),
    readme: Type.String(),
})

export type NPMPackage = Static<typeof NPMPackage>
