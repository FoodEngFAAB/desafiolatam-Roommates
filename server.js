const axios = require('axios')
const http = require('http')
const url = require('url')
const fs = require('fs')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

const { newUser, addGasto, modGasto } = require('./roommates.js')
const enviar = require('./mailer.js')

const port = 3000

http
    .createServer(async (req, res) => {
        //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
        //Devuelve el documento HTML disponibilizado en el apoyo
        if ((req.url == '/') && (req.method == 'GET')) {
            res.setHeader('content-type', 'text/html')
            res.end(fs.readFileSync('index.html', 'utf-8'))
        }
        //Parseo de roommates.json
        let roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf-8"))
        let roommates = roommatesJSON.roommates
        //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
        //Devuelve los roommates almacenados
        if ((req.url == '/roommates') && (req.method == 'GET')) {
            res.setHeader('content-type', 'application/json')
            res.end(fs.readFileSync('roommates.json', 'utf-8'))
        }
        //Almacena un nuevo roommate ocupando random user
        else if (req.url.includes('/roommate') && req.method == 'POST') {
            res.setHeader('content-type', 'application/json')
            newUser().then(async (roommate) => {
                addroommate(roommate)
                res.writeHead(201).end(JSON.stringify(roommate))
            })
                .catch((e) => {res.writeHead(500).end("Error al agregar usuario.", e)})
        }
        //Elimina gasto del historial
        else if (req.url.includes("/roomates") && req.method == "DELETE") {
            //Parseo
            const { id } = url.parse(req.url, true).query
            //Filtra el usuario
            roommatesJSON.roommates = roommates.filter((i) => i.id !== id)
            //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
            //Elimina gasto
            fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON))
            res.writeHead(200).end("Gasto eliminado.")
        }
        //Muestra gastos del usuario
        let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf-8'))
        let gastos = gastosJSON.gastos

        //Devuelve el historial con los gastos registrados
        if (req.url.includes('/gastos') && req.method == 'GET') {
            res.end(JSON.stringify(gastosJSON))
        }
        //Agrega gastos asociados al usuario
        else if (req.url.includes('/gasto') && req.method == 'POST') {
            let data = ""
            req.on('data', (payload) => {
                data += payload
            })
            req.on('end', () => {
                body = JSON.parse(data)
                gasto = {
                    //El objeto correspondiente al usuario que se almacenará debe tener un id generado con el paquete UUID
                    id: uuidv4().slice(20),
                    roommate: body.roommate,
                    descripcion: body.descripcion,
                    monto: body.monto
                }
                gastos.push(gasto)
                addGasto(body)
                let roommate = JSON.parse(fs.readFileSync("roommates.json", "utf-8"))
                let datosRm = roommate.roommates
                let nombre = gastos.map((r) => r.roommate)
                let descripcion = gastos.map((r) => r.descripcion)
                let monto = gastos.map((r) => r.monto)
                let correos = datosRm.map((r) => r.correo)

                //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
                //Envío de correos electrónicos
                enviar(nombre, descripcion, monto, correos)
                    .then(() => {
                        res.end()
                    })
                    .catch((e) => {
                        res.writeHead(500).end("Envío de correo electrónico fallido.", e)
                    })
                fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON))
                res.writeHead(201).end("Los gastos han sido creados.")
            })
        }
        //Edita los datos de un gasto
        else if (req.url.includes('/gasto') && req.method == 'PUT') {

            let data = ""
            const { id } = url.parse(req.url, true).query
            req.on("data", (payload) => {
                data += payload
            })
            req.on("end", () => {
                let body = JSON.parse(data)
                body.id = id
                modGasto(body)
                gastosJSON.gastos = gastos.map((i) => {
                    if (i.id != body.id) {
                        return i
                    }
                    return body
                })
                //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
                fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON), (err) => {
                    err ? console.log('Error. Ingreso de gastos.') : console.log('Ingreso de gastos exitoso.')
                })
                res.writeHead(201).end("Gastos actualizados.")
            })
        }
        //Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
        //Elimina gasto del historial
        else if (req.url.includes("/gasto") && req.method == "DELETE") {
            const { id } = url.parse(req.url, true).query
            gastosJSON.gastos = gastos.filter((i) => i.id !== id)
            fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON))
            res.writeHead(200).end("Gasto eliminado exitosamente")
        }
    })
    .listen(port, () => console.log('Ejecutando en puerto', port))

//Ocupar el módulo File System para la manipulación de archivos alojados en el servidor
const addroommate = (roommates) => {
    const partiJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf-8'))
    partiJSON.roommates.push(roommates)
    fs.writeFileSync('roommates.json', JSON.stringify(partiJSON))
}