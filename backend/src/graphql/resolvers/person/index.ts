import { IResolvers } from "../cron"
import { PersonResolver } from "./person.resolver"

const personResolver = new PersonResolver()

export const resolversPerson:IResolvers = {
    Query:{
        getPerson: personResolver.getPeople.bind(personResolver),
    },
    Person: {
        __resolveType(obj:any){
            return obj.age ? 'Female': 'Male'
        }
    }
}







