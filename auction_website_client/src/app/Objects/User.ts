export interface User {
    readonly _id: string,
    username: string,
    name: string,
    surname: string,
    mail: string,
    location: string,
    mod: boolean,
    validated: boolean,
}