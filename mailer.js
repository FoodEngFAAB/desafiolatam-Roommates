const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemaileradl2@gmail.com',
        pass: "prueba123.",
    }
})

//Envía correos electrónicos
const enviar = (nombre, descripcion, monto) => {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'nodemaileradl2@gmail.com',
            to: ['faguilerab@docente.uss.cl', 'faguilera9@santotomas.cl', 'foodengfaab@gmail.com'],
            subject: `Se ha agregado un nuevo gasto.`,
            text: `Los gastos (acumulados) corresponden a ${nombre}.\nDescriptor(es): ${descripcion}\nMonto(s): $${monto}.
            \n\n\nProvided by Roommates Latam Challenge - by Fabián A. Aguilera B.`,
        }
        transporter.sendMail(mailOptions, (err, data) => {
            if (data) {
                resolve(data)
            }
            if (err) {
                reject(err)
            }
        })
    })
}

module.exports = enviar