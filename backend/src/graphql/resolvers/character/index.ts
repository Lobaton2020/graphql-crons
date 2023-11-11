import { CharacterResolver } from "../character/character.resolver"
import { HelloResolver } from "../character/hello.resolver"
import { IResolvers } from "../cron"

const helloResolver = new HelloResolver()
const characterResolver = new CharacterResolver()

export const resolversCharacter:IResolvers = {
    Query:{
        hello: helloResolver.run.bind(helloResolver),
        characters: characterResolver.run.bind(characterResolver),
    }
}
