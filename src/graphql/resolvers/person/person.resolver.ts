export interface Person{
    id: string,
    name: string
    address: string
    age?: number
}
export const dataPerson = [
    {
        id:"1",
        name:"Juan",
        address:"ADD 001"
    },
    {
        id:"2",
        name:"Camilo",
        address:"ADD 001"
    },
    {
        id:"3",
        name:"Pedro",
        address:"ADD 003"
    },
    {
        id:"4",
        name:"Lopaz",
        address:"ADD 004",
        age:23
    },
    {
        id:"5",
        name:"Plitarco",
        address:"ADD 005"
    }
]
export class PersonResolver{
    getPeople(root:void, args: {id:string}): Person | null{
        return dataPerson.find(x => x.id ==  args.id) ?? null
    }

}