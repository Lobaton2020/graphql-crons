export enum Race {
    HILIAM = 'HILIAM',
    GERUDO = 'GERUDO',
    FAILIN = 'FAILIN',
}
export interface Character {
    id:number
    race:Race
    name:string
}
export class CharacterResolver{
    run():Character[]{
        return [
            {
                id:1,
                name: "Juank",
                race: Race.HILIAM
            },
            {
                id:2,
                name: "Elpe",
                race: Race.FAILIN
            },
            {
                id:3,
                name: "CHACA",
                race: Race.GERUDO
            }
        ]
    }
}