import 'dotenv/config';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_WHATSAPP_NUMBER!;
const to = 'whatsapp:+5561994121708';

const client = twilio(accountSid, authToken);

client.messages
  .create({
    from,
    body: 'Teste manual de envio via Twilio!',
    to,
  })
  .then(message => {
    console.log('Mensagem enviada! SID:', message.sid);
  })
  .catch(err => {
    console.error('Erro ao enviar:', err);
  });