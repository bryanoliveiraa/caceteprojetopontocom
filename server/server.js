require('dotenv').config();
const express = require('express');
const { Twilio } = require('twilio');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


app.post('/whatsapp', async (req, res) => {
  const incomingMsg = req.body.Body;
  const sender = req.body.From;

  try {

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Você é um atendente virtual de um hortifruti. Seja educado e responda em português." 
        },
        { role: "user", content: incomingMsg }
      ],
    });

    const resposta = gptResponse.choices[0].message.content;

   
    await twilioClient.messages.create({
      body: resposta,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: sender
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro ao processar mensagem.");
  }
});


app.get('/', (req, res) => res.send('Servidor rodando!'));

module.exports = app;