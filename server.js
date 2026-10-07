require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Groq = require("groq-sdk");
const sharp = require("sharp");

const app = express();
const PORT = 3000;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const upload = multer({
    dest: "uploads/"
});

app.use(express.static("public"));

app.post("/analizar", upload.single("foto"), async (req, res) => {

    try {

        console.log("📷 Foto recibida");

        if (!req.file) {
            return res.status(400).json({
                error: "No se recibió ninguna fotografía."
            });
        }

        const imagen = await sharp(req.file.path)
    .resize({
        width: 5000,
        height: 5000,
        fit: "inside",
        withoutEnlargement: true
    })
    .jpeg({
        quality: 85
    })
    .toBuffer();

const base64 = imagen.toString("base64");

        const resultado = await groq.chat.completions.create({
            model: "qwen/qwen3.8-27b",

            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
Analiza esta fotografía para PetDex.

Identifica si aparece un perro o un gato.

Proporciona información clara y sencilla:

- animal
- raza probable
- tamaño aproximado
- esperanza de vida aproximada
- características
- cuidados
- alimentación
- ejercicio

Si no puedes identificar la raza con seguridad, indícalo claramente.

No hagas diagnósticos médicos.

Responde únicamente en formato JSON con estas propiedades:

animal
raza
tamano
esperanza_vida
caracteristicas
cuidados
alimentacion
ejercicio
`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${req.file.mimetype};base64,${base64}`
                            }
                        }
                    ]
                }
            ],

            response_format: {
                type: "json_object"
            },

            temperature: 0.2,
            max_completion_tokens: 1000
        });

        console.log("🤖 Groq respondió");

        const texto = resultado.choices[0].message.content;

        const datos = JSON.parse(texto);

        res.json(datos);

        fs.unlinkSync(req.file.path);

    } catch (error) {

        console.error("❌ Error:", error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: "Ocurrió un error al analizar la fotografía."
        });
    }
});

app.listen(PORT, () => {
    console.log(`PetDex está funcionando en http://localhost:${PORT}`);
});