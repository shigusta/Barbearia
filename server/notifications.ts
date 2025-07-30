import twilio from "twilio";
import type { AgendamentoComRelacoes } from "@shared/schema";

// Inicializa o cliente Twilio com as credenciais do .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !twilioWhatsappNumber) {
  console.warn(
    "⚠️  Credenciais do Twilio não configuradas. As notificações por WhatsApp estão desativadas."
  );
}

const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

// Função utilitária para formatar o número de telefone
function formatarNumeroWhatsapp(numero: string): string {
  let limpo = numero.replace(/\D/g, "");
  if (limpo.length === 11 && limpo.startsWith("55")) {
    return `whatsapp:${limpo}`;
  }
  if (limpo.length === 11) {
    return `whatsapp:55${limpo}`;
  }
  // Adicione outras regras se necessário
  return `whatsapp:55${limpo}`;
}

function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}


 //Envia uma mensagem de confirmação de agendamento.
export async function enviarWhatsappConfirmacao(
  agendamento: AgendamentoComRelacoes
): Promise<void> {
  if (!twilioClient) {
    console.log("Skipping WhatsApp notification due to missing credentials.");
    return;
  }

  const numeroCliente = formatarNumeroWhatsapp(agendamento.telefone_cliente);
  const mensagem = `🎉 Olá, ${
    agendamento.nome_cliente
  }! Seu agendamento na Elite Barber foi *confirmado*!

*Serviço:* ${agendamento.servico.nome}
*Barbeiro:* ${agendamento.barbeiro.nome}
*Data e Hora:* ${formatarDataHora(new Date(agendamento.data_hora_inicio))}

Aguardamos por ti! Se precisar, entre em contato pelo número (11) 99999-9999.`;

  try {
    await twilioClient.messages.create({
      from: twilioWhatsappNumber,
      to: numeroCliente,
      body: mensagem,
    });
    console.log(`✅ Notificação de CONFIRMAÇÃO enviada para ${numeroCliente}`);
  } catch (error) {
    console.error(
      `❌ Erro ao enviar WhatsApp de confirmação para ${numeroCliente}:`,
      error
    );
  }
}

// Envia uma mensagem de cancelamento de agendamento.

export async function enviarWhatsappCancelamento(
  agendamento: AgendamentoComRelacoes
): Promise<void> {
  if (!twilioClient) {
    console.log("Skipping WhatsApp notification due to missing credentials.");
    return;
  }

  const numeroCliente = formatarNumeroWhatsapp(agendamento.telefone_cliente);
  const mensagem = `😕 Olá, ${
    agendamento.nome_cliente
  }. Informamos que o seu agendamento na Elite Barber para ${formatarDataHora(
    new Date(agendamento.data_hora_inicio)
  )} foi *cancelado*.

Para reagendar ou em caso de dúvidas, por favor, entre em contato conosco pelo número (11) 99999-9999.
Pedimos desculpa por qualquer inconveniente.`;

  try {
    await twilioClient.messages.create({
      from: twilioWhatsappNumber,
      to: numeroCliente,
      body: mensagem,
    });
    console.log(`✅ Notificação de CANCELAMENTO enviada para ${numeroCliente}`);
  } catch (error) {
    console.error(
      `❌ Erro ao enviar WhatsApp de cancelamento para ${numeroCliente}:`,
      error
    );
  }
}
