import {GraphQLSchema} from 'graphql'
import { makeExecutableSchema,  } from 'graphql-tools'
import { mergeSchemas } from '@graphql-tools/schema'
import 'graphql-import-node'
import rootSchema from './schemas/root.graphql'
import cronSchema from './schemas/cron.graphql'
import personSchema from './schemas/person.graphql'
import { resolversCharacter } from './resolvers/character'
import { resolversCron } from './resolvers/cron'
import { resolversPerson } from './resolvers/person'

const compiledRootSchema = makeExecutableSchema({
    typeDefs: rootSchema,
    resolvers: resolversCharacter
});

const compiledCronSchema = makeExecutableSchema({
    typeDefs: cronSchema,
    resolvers: resolversCron
});

const compiledPersonSchema = makeExecutableSchema({
    typeDefs: personSchema,
    resolvers: resolversPerson
});

export const schema:GraphQLSchema = mergeSchemas({
    schemas:[
        compiledRootSchema,
        compiledCronSchema,
        compiledPersonSchema
    ],
})