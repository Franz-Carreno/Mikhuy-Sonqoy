import express from 'express';
import cors from 'cors';


import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Configuración de la carpeta de logs
const logDirectory = path.join(__dirname, 'logs');

// Asegúrate de que la carpeta de logs existe
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Inicializa el cliente de Gemini (Reemplaza la inicialización de hf)
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 

app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function logError(description) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${description}\n`;
    fs.appendFile(path.join(logDirectory, 'errors.log'), logMessage, (err) => {
        if (err) {
            console.error('Error al escribir en el archivo de logs:', err);
        }
    });
}



app.post('/api/chatbot', async (req, res) => {
    const userMessage = req.body.message;
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: userMessage
                    }
                ]
            }
        ]
    };
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            console.error(`Error en la solicitud a la API de Gemini: ${response.status} - ${response.statusText}`);
            const errorData = await response.json();
            console.error('Detalles del error de la API:', errorData);
            throw new Error('Error al conectar con la IA. Código: ' + response.status);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            const botResponse = data.candidates[0].content.parts[0].text;
            res.json({ response: botResponse });
        } else {
            console.error('Respuesta de la API de Gemini inesperada:', data);
            throw new Error('Respuesta de la IA en formato incorrecto.');
        }

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Hubo un error al procesar tu solicitud.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor de chatbot escuchando en http://localhost:${port}`);
});