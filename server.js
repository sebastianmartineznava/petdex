require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
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

        const imagen = fs.readFileSync(req.file.path);
        const base64 = imagen.toString("base64");

        const interaction = await ai.interactions.create({
            model: "gemini-3.8-flash",

            input: [
                {
                    type: "image",
                    data: base64,
                    mime_type: req.file.mimetype
                },
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
                }
            ]
        });

        console.log("🤖 Gemini respondió");

        let texto = interaction.output_text;

texto = texto
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const resultado = JSON.parse(texto);

res.json(resultado);

        fs.unlinkSync(req.file.path);

    } catch (error) {

        console.error("❌ Error:", error);

        res.status(500).json({
            error: "Ocurrió un error al analizar la fotografía."
        });
    }
});

app.listen(PORT, () => {
    console.log(`PetDex está funcionando en http://localhost:${PORT}`);
});