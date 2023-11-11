import { CreateCronDto } from "../../graphql/resolvers/cron/cron.resolver"
import { connection } from "../adapter/config"

export interface Cron{
    id: string
    name: string
    date: Date
}
export interface Task{
    description: string
    state: boolean
    hour:number,
    minute:number
    project:{
        id:number
        name:string
    }
}

export class CronDao{
    async getCrons():Promise<Cron[]>{
        return new Promise((resolve, reject)=>{
                connection.query("SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma",(err, data)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(data)
                })
        })
    }
    async getCronById(id: number):Promise<Cron>{
        return new Promise((resolve, reject)=>{
                connection.query("SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma WHERE id_cronograma_PK = ?",[id],(err, data)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(data[0])
                })
        })
    }

    getTasksByCronId(id:number){
        console.log("++")
        return new Promise((resolve, reject)=>{
            connection.query(`SELECT
                id_tarea_cronograma_PK as id,
                descripcion as description,
                estado as state,
                hora as hour,
                minuto as minute
                FROM tarea_cronograma WHERE id_cronograma_FK = ?`,[id]
            ,(err, data)=>{
                if(err){
                    return reject(err)
                }
                return resolve(data)
            })
    })
    }

    getProjectByTaskId(id:number){
        return new Promise((resolve, reject)=>{
            connection.query(`SELECT
                p.id as id,
                p.name as name
                FROM tarea_cronograma t
                 INNER JOIN projects p ON p.id = t.project_id
                WHERE t.id_tarea_cronograma_PK = ?`,[id]
            ,(err, data)=>{
                if(err){
                    return reject(err)
                }
                return resolve(data[0])
            })
    })
    }

    async createCron(userId:number, data: CreateCronDto):Promise<void>{
        return new Promise((resolve, reject)=>{
                connection.query("INSERT INTO cronograma(id_usuario_FK, titulo, fecha) VALUES(?, ?, ?);",[userId, data.name, new Date(data.date)],(err, data)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve()
                })
        })
    }
    async editCron(id:number, data: CreateCronDto):Promise<void>{
        return new Promise((resolve, reject)=>{
                connection.query("UPDATE cronograma SET titulo = ?, fecha = ? WHERE id_cronograma_PK = ?;"
                ,[data.name, new Date(data.date), id],(err, data)=>{
                    if(err){
                        return reject(err)
                    }
                    if(data.affectedRows == 0){
                        return reject(new Error("Couldn't update the database, Record doesn't exist"))
                    }
                    return resolve()
                })
        })
    }
    async existCronByName(name:string){
        return new Promise((resolve, reject)=>{
            connection.query("SELECT id_cronograma_PK FROM cronograma WHERE titulo = ?;"
            ,[name],(err, data)=>{
                if(err){
                    return reject(err)
                }
                return resolve(data[0])
            })
    })
    }
}
