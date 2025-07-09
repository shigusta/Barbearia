import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  horariosFuncionamento,
  insertAgendamentoSchema,
  servicos as tabelaServicos,
  barbeiros as tabelaBarbeiros,
} from "@shared/schema";
import { z } from "zod";
import { isToday, set } from "date-fns";
import { db } from "./db";

// Schemas de Validação
const createAgendamentoSchema = insertAgendamentoSchema.extend({
  nome_cliente: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone_cliente: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email_cliente: z.string().email("Email inválido"),
});

const horariosDisponiveisSchema = z.object({
  // CORREÇÃO: Lê a data de forma segura, evitando problemas de fuso horário.
  data: z.string().transform((str) => {
    const dateOnly = str.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  }),
  servico_id: z.string().transform((str) => parseInt(str)),
  barbeiro_id: z
    .string()
    .transform((str) => parseInt(str))
    .optional(),
});

const contactFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  await seedInitialData();

  // Get all services
  app.get("/api/servicos", async (req, res) => {
    try {
      const servicos = await storage.getServicos();
      res.json(servicos);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all barbers
  app.get("/api/barbeiros", async (req, res) => {
    try {
      const barbeiros = await storage.getBarbeiros();
      res.json(barbeiros);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get available time slots
  app.get("/api/horarios-disponiveis", async (req, res) => {
    try {
      const validation = horariosDisponiveisSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          message: "Parâmetros inválidos",
          errors: validation.error.errors,
        });
      }

      const { data, servico_id, barbeiro_id } = validation.data;

      const servico = await storage.getServicoById(servico_id);
      if (!servico) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      let agendamentosExistentes = [];
      let totalBarbeirosDisponiveis = 1;

      if (barbeiro_id) {
        agendamentosExistentes = await storage.getAgendamentosByDate(
          data,
          barbeiro_id
        );
      } else {
        const barbeirosAtivos = await storage.getBarbeiros();
        totalBarbeirosDisponiveis = barbeirosAtivos.length;
        agendamentosExistentes = await storage.getAgendamentosByDate(data);
      }

      if (totalBarbeirosDisponiveis === 0) {
        return res.json([]);
      }

      // MUDANÇA: Adicionado 'await' pois a função agora é assíncrona
      const horariosDisponiveis = await generateAvailableTimeSlots(
        data,
        servico.duracao_minutos,
        agendamentosExistentes,
        totalBarbeirosDisponiveis
      );

      res.json(horariosDisponiveis);
    } catch (error) {
      console.error("Error fetching available times:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create appointment
  app.post("/api/agendar", async (req, res) => {
    try {
      // PASSO DE TRANSFORMAÇÃO ADICIONADO AQUI
      const dataToValidate = {
        ...req.body,
        data_hora_inicio: req.body.data_hora_inicio
          ? new Date(req.body.data_hora_inicio)
          : undefined,
        data_hora_fim: req.body.data_hora_fim
          ? new Date(req.body.data_hora_fim)
          : undefined,
      };

      const validation = createAgendamentoSchema.safeParse(dataToValidate);

      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: validation.error.errors,
        });
      }

      let agendamentoData = { ...validation.data };

      // --- NOVA LÓGICA DE VERIFICAÇÃO DE CONFLITO ---
      const agendamentosConflitantes =
        await storage.getAgendamentosPorIntervalo(
          agendamentoData.data_hora_inicio,
          agendamentoData.data_hora_fim
        );

      if (agendamentoData.barbeiro_id) {
        // CENÁRIO 1: O cliente escolheu um barbeiro específico.
        const temConflito = agendamentosConflitantes.some(
          (ag) => ag.barbeiro_id === agendamentoData.barbeiro_id
        );

        if (temConflito) {
          return res
            .status(409)
            .json({ message: "Este barbeiro já está ocupado neste horário." });
        }
      } else {
        // CENÁRIO 2: O cliente escolheu "Qualquer Barbeiro".
        const barbeirosAtivos = await storage.getBarbeiros();

        // Se o número de agendamentos no horário for igual ou maior que o de barbeiros, o horário está cheio.
        if (agendamentosConflitantes.length >= barbeirosAtivos.length) {
          return res.status(409).json({
            message:
              "Desculpe, este horário acabou de ser preenchido. Por favor, escolha outro.",
          });
        }

        // Lógica para encontrar um barbeiro que esteja livre
        const idsBarbeirosOcupados = agendamentosConflitantes.map(
          (ag) => ag.barbeiro_id
        );
        const barbeiroLivre = barbeirosAtivos.find(
          (barbeiro) => !idsBarbeirosOcupados.includes(barbeiro.id)
        );

        if (!barbeiroLivre) {
          // Apenas uma segurança, é improvável que chegue aqui.
          return res.status(409).json({
            message: "Não foi possível encontrar um barbeiro disponível.",
          });
        }

        // Atribui o agendamento ao barbeiro livre que foi encontrado!
        agendamentoData.barbeiro_id = barbeiroLivre.id;
      }
      // --- FIM DA NOVA LÓGICA ---

      const agendamento = await storage.createAgendamento(agendamentoData);
      res.status(201).json({
        message: "Agendamento realizado com sucesso!",
        agendamento,
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  });

  // Get all appointments (admin)
  app.get("/api/agendamentos", async (req, res) => {
    try {
      const agendamentos = await storage.getAgendamentos();
      res.json(agendamentos);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update appointment status (admin)
  app.patch("/api/agendamentos/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (
        !status ||
        !["confirmado", "cancelado", "concluido"].includes(status)
      ) {
        return res.status(400).json({ message: "Status inválido" });
      }

      await storage.updateAgendamentoStatus(id, status);
      res.json({ message: "Status atualizado com sucesso" });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete appointment (admin)
  app.delete("/api/agendamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAgendamento(id);
      res.json({ message: "Agendamento excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Contact form submission
  app.post("/api/contato", async (req, res) => {
    try {
      const validation = contactFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: validation.error.errors,
        });
      }

      console.log("Contact form submission:", validation.data);

      res.json({
        message:
          "Mensagem enviada com sucesso! Entraremos em contato em breve.",
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAvailableTimeSlots(
  date: Date,
  durationMinutes: number,
  existingAppointments: any[],
  totalBarbeiros: number
): Promise<{ inicio: string; fim: string; display: string }[]> {
  const slots: { inicio: string; fim: string; display: string }[] = [];
  const slotInterval = 15;
  const diaDaSemana = date.getUTCDay(); // 0 = Domingo, 1 = Segunda, etc.

  // --- NOVA LÓGICA: BUSCA HORÁRIOS DO BANCO ---
  const horarioDoDia = await storage.getHorarioDeFuncionamentoPorDia(
    diaDaSemana
  );

  // Se não houver horário definido para o dia ou se a barbearia estiver fechada (inativo)
  if (!horarioDoDia || !horarioDoDia.ativo) {
    return []; // Retorna uma lista vazia, pois a barbearia está fechada neste dia.
  }

  // Pega os horários de início e fim do banco de dados e converte para números
  const workStart = parseInt(horarioDoDia.hora_inicio.split(":")[0]);
  const endHour = parseInt(horarioDoDia.hora_fim.split(":")[0]);
  const endMinute = parseInt(horarioDoDia.hora_fim.split(":")[1]);
  // --- FIM DA NOVA LÓGICA ---

  const agora = new Date();

  for (let hour = workStart; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const slotStart = set(date, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });

      if (isToday(date) && slotStart.getTime() < agora.getTime()) {
        continue;
      }

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

      // Ajuste para considerar os minutos do fim do expediente
      if (
        slotEnd.getHours() > endHour ||
        (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMinute)
      ) {
        continue;
      }

      const conflictingAppointments = existingAppointments.filter(
        (appointment) => {
          const existingStart = new Date(appointment.data_hora_inicio);
          const existingEnd = new Date(appointment.data_hora_fim);
          return (
            (slotStart >= existingStart && slotStart < existingEnd) ||
            (slotEnd > existingStart && slotEnd <= existingEnd) ||
            (slotStart <= existingStart && slotEnd >= existingEnd)
          );
        }
      );

      if (conflictingAppointments.length < totalBarbeiros) {
        slots.push({
          inicio: slotStart.toISOString(),
          fim: slotEnd.toISOString(),
          display: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
        });
      }
    }
  }
  return slots;
}

// Seed initial data
async function seedInitialData() {
  try {
    // Checa se o primeiro barbeiro já existe. Se sim, assume que tudo já foi criado.
    const [firstBarber] = await db.select().from(tabelaBarbeiros).limit(1);
    if (firstBarber) {
      console.log("Data already exists. Skipping seed.");
      return; // Para a execução aqui se os dados já existem
    }

    console.log("Seeding initial data...");

    // Create barbers
    await storage.createBarbeiro({ nome: "João Silva", ativo: true });
    await storage.createBarbeiro({ nome: "Pedro Santos", ativo: true });

    // Create services
    await storage.createServico({
      nome: "Corte Tradicional",
      descricao: "...",
      duracao_minutos: 45,
      preco: "45.00",
      ativo: true,
    });
    await storage.createServico({
      nome: "Barba Terapia",
      descricao: "...",
      duracao_minutos: 30,
      preco: "35.00",
      ativo: true,
    });
    await storage.createServico({
      nome: "Combo Completo",
      descricao: "...",
      duracao_minutos: 90,
      preco: "75.00",
      ativo: true,
    });
    await storage.createServico({
      nome: "Sobrancelha",
      descricao: "...",
      duracao_minutos: 15,
      preco: "20.00",
      ativo: true,
    });

    // Create default operating hours
    const horariosParaInserir = [
      {
        dia_da_semana: 0,
        hora_inicio: "00:00",
        hora_fim: "00:00",
        ativo: false,
      }, // Domingo
      {
        dia_da_semana: 1,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      }, // Segunda
      {
        dia_da_semana: 2,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      }, // Terça
      {
        dia_da_semana: 3,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      }, // Quarta
      {
        dia_da_semana: 4,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      }, // Quinta
      {
        dia_da_semana: 5,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      }, // Sexta
      {
        dia_da_semana: 6,
        hora_inicio: "09:00",
        hora_fim: "17:00",
        ativo: true,
      }, // Sábado
    ];
    await db.insert(horariosFuncionamento).values(horariosParaInserir);

    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}
