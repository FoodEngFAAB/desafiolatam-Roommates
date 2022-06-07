const axios = require('axios')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const newUser = async () => {
    const radomUser = await axios('https://randomuser.me/api')
    const userData = radomUser.data.results[0]
    const roommate = {
        id: uuidv4().slice(0.6),
        nombre: `${userData.name.first} ${userData.name.last}`,
        correo: userData.email,
        debe: 0,
        recibe: 0,
    }
    return roommate
}

const addGasto = (body) => {
    let readRoommate = JSON.parse(fs.readFileSync("roommates.json", "utf-8"))
    let roommateData = readRoommate.roommates
    let countRoommate = roommateData.length
    roommateData.map((i) => {
        if (i.nombre !== body.roommate) {
            let debe = body.monto / countRoommate
            i.debe += parseFloat(debe.toFixed(1))
        } else if (i.nombre == body.roommate) {
            let recibe = body.monto / countRoommate
            i.recibe += parseFloat(recibe.toFixed(1))
        }
        fs.writeFileSync("roommates.json", JSON.stringify(readRoommate))
    })
}

const modGasto = (body) => {
    let roommate = JSON.parse(fs.readFileSync("roommates.json", "utf-8"))
    let roomateData = roommate.roommates
    let countRoommate = roomateData.length
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf-8"))
    gastosJSON.gastos.map((i) => {
        roomateData.map((j) => {
            if (j.nombre !== body.roommate) {
                let newCount = countRoommate - 1
                let newGasto = i.monto / newCount
                let debe
                debe = newGasto
                j.debe = parseFloat(debe.toFixed(1))
            } else if (j.nombre == body.roommate) {
                let recibe
                recibe = body.monto / countRoommate
                j.recibe = parseFloat(recibe.toFixed(1))
            }
        })
        fs.writeFileSync("roommates.json", JSON.stringify(roommate))
    })
}

module.exports = { newUser, addGasto, modGasto }