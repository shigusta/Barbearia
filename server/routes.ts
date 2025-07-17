import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAgendamentoSchema,
  type AgendamentoComRelacoes,
  type BloqueioAgenda,
  type InsertAgendamento,
} from "@shared/schema";
import { z } from "zod";
import { isToday, set } from "date-fns";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./auth";
import {
  enviarWhatsappConfirmacao,
  enviarWhatsappCancelamento,
} from "./notifications.ts";

const createAgendamentoSchema = insertAgendamentoSchema
  .extend({
    nome_cliente: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    telefone_cliente: z
      .string()
      .min(10, "Telefone deve ter pelo menos 10 dígitos"),
    email_cliente: z.string().email("Email inválido"),
  })
  .merge(
    z.object({
      barbeiro_id: z.number().optional().nullable(),
    })
  );

const createBloqueioSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  hora_inicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  hora_fim: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  motivo: z.string().optional(),
  barbeiro_id: z.number().nullable().optional(), // Pode ser nulo para "Todos"
});

const horariosDisponiveisSchema = z.object({
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

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/servicos", async (req, res) => {
    try {
      const servicos = await storage.getServicos();
      res.json(servicos);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/barbeiros", async (req, res) => {
    try {
      const barbeiros = await storage.getBarbeiros();
      res.json(barbeiros);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

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

      const barbeirosAtivos = barbeiro_id
        ? [await storage.getBarbeiroById(barbeiro_id)].filter(Boolean)
        : await storage.getBarbeiros();

      const totalBarbeirosDisponiveis = barbeirosAtivos.length;
      if (totalBarbeirosDisponiveis === 0) {
        return res.json([]);
      }

      const inicioDoDia = new Date(data);
      inicioDoDia.setUTCHours(0, 0, 0, 0);

      const fimDoDia = new Date(data);
      fimDoDia.setUTCHours(23, 59, 59, 999);

      const agendamentosDoDia = await storage.getAgendamentosByDate(
        data,
        barbeiro_id
      );
      const bloqueiosDoDia = await storage.getBloqueiosPorPeriodo(
        inicioDoDia,
        fimDoDia
      );

      const horariosDisponiveis = await generateAvailableTimeSlots(
        data,
        servico.duracao_minutos,
        agendamentosDoDia,
        bloqueiosDoDia,
        totalBarbeirosDisponiveis,
        barbeiro_id
      );

      res.json(horariosDisponiveis);
    } catch (error) {
      console.error("Error fetching available times:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ message: "Usuário e senha são obrigatórios." });
      }

      const { username, password } = validation.data;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Usuário ou senha inválidos." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Usuário ou senha inválidos." });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET não definido no .env");
      }

      const payload = { userId: user.id, username: user.username };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });

      res.json({
        message: "Login realizado com sucesso!",
        token: token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  });

  app.post("/api/agendar", async (req, res) => {
    try {
      console.log("-----------------------------------------");
      console.log("Recebido pedido em /api/agendar:", req.body);

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
      console.log(
        `Dados após validação. Barbeiro ID: ${agendamentoData.barbeiro_id}`
      );

      const APPOINTMENT_LIMIT = 1; // O limite é 1 agendamento futuro
      const futureAppointmentsCount =
        await storage.countFutureAppointmentsByPhone(
          agendamentoData.telefone_cliente
        );

      if (futureAppointmentsCount >= APPOINTMENT_LIMIT) {
        return res.status(409).json({
          // 409 significa "Conflito"
          message:
            "Limite de agendamentos atingido. Você já possui um agendamento futuro e só poderá marcar outro após a sua conclusão.",
        });
      }

      if (agendamentoData.barbeiro_id) {
        console.log(
          `Cenário 1: Barbeiro específico selecionado (ID: ${agendamentoData.barbeiro_id})`
        );
        const conflitos = await storage.getAgendamentosPorIntervalo(
          agendamentoData.data_hora_inicio,
          agendamentoData.data_hora_fim,
          agendamentoData.barbeiro_id
        );
        if (conflitos.length > 0) {
          return res
            .status(409)
            .json({ message: "Este barbeiro já está ocupado neste horário." });
        }
      } else {
        console.log(
          `Cenário 1: Barbeiro específico selecionado (ID: ${agendamentoData.barbeiro_id})`
        );
        const barbeirosAtivos = await storage.getBarbeiros();
        const conflitosGerais = await storage.getAgendamentosPorIntervalo(
          agendamentoData.data_hora_inicio,
          agendamentoData.data_hora_fim
        );
        if (conflitosGerais.length >= barbeirosAtivos.length) {
          return res.status(409).json({
            message:
              "Desculpe, todos os barbeiros estão ocupados neste horário.",
          });
        }
        const idsBarbeirosOcupados = new Set(
          conflitosGerais.map((ag) => ag.barbeiro_id)
        );
        const barbeiroLivre = barbeirosAtivos.find(
          (barbeiro) => !idsBarbeirosOcupados.has(barbeiro.id)
        );
        if (!barbeiroLivre) {
          return res.status(409).json({
            message:
              "Não foi possível encontrar um barbeiro disponível neste horário.",
          });
        }
        agendamentoData.barbeiro_id = barbeiroLivre.id;
      }

      const agendamento = await storage.createAgendamento(
        agendamentoData as InsertAgendamento
      );

      // ✅ CHAMA A NOTIFICAÇÃO DE CONFIRMAÇÃO
      const agendamentoCompleto = await storage.getAgendamentoById(
        agendamento.id
      );
      if (agendamentoCompleto) {
        enviarWhatsappConfirmacao(agendamentoCompleto);
      }

      res.status(201).json({
        message: "Agendamento realizado com sucesso!",
        agendamento,
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  });

  // Listar todos os bloqueios
  app.get("/api/bloqueios", authenticateToken, async (req, res) => {
    try {
      const bloqueios = await storage.getBloqueios();
      res.json(bloqueios);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar um novo bloqueio
  app.post("/api/bloqueios", authenticateToken, async (req, res) => {
    try {
      const validation = createBloqueioSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados de bloqueio inválidos",
          errors: validation.error.flatten(),
        });
      }

      const { data, hora_inicio, hora_fim, motivo, barbeiro_id } =
        validation.data;

      // Combina data e hora para criar objetos Date completos
      const data_inicio = new Date(`${data}T${hora_inicio}:00`);
      const data_fim = new Date(`${data}T${hora_fim}:00`);

      const novoBloqueio = await storage.createBloqueio({
        data_inicio,
        data_fim,
        motivo,
        barbeiro_id: barbeiro_id === null ? undefined : barbeiro_id, // Converte null para undefined para o DB
      });

      res.status(201).json(novoBloqueio);
    } catch (error) {
      console.error("Error creating block:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Apagar um bloqueio
  app.delete("/api/bloqueios/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }
      await storage.deleteBloqueio(id);
      res.status(200).json({ message: "Bloqueio removido com sucesso." });
    } catch (error) {
      console.error("Error deleting block:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/agendamentos", authenticateToken, async (req, res) => {
    try {
      const agendamentos = await storage.getAgendamentos();
      res.json(agendamentos);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch(
    "/api/agendamentos/:id/status",
    authenticateToken,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (
          !status ||
          !["confirmado", "cancelado", "concluido"].includes(status)
        ) {
          return res.status(400).json({ message: "Status inválido" });
        }

        // ✅ CHAMA A NOTIFICAÇÃO DE CANCELAMENTO
        if (status === "cancelado") {
          const agendamentoParaCancelar = await storage.getAgendamentoById(id);
          if (agendamentoParaCancelar) {
            enviarWhatsappCancelamento(agendamentoParaCancelar);
          }
        }

        await storage.updateAgendamentoStatus(id, status);
        res.json({ message: "Status atualizado com sucesso" });
      } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  );

  app.delete("/api/agendamentos/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAgendamento(id);
      res.json({ message: "Agendamento excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/contato", async (req, res) => {
    try {
      const validation = contactFormSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("❌ Erro de validação Zod:", validation.error.errors);
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
  existingAppointments: AgendamentoComRelacoes[],
  existingBlocks: BloqueioAgenda[],
  totalBarbeiros: number,
  barbeiroId?: number
): Promise<{ inicio: string; fim: string; display: string }[]> {
  const slots: { inicio: string; fim: string; display: string }[] = [];
  const slotInterval = 15;
  const diaDaSemana = date.getUTCDay();

  const horarioDoDia = await storage.getHorarioDeFuncionamentoPorDia(
    diaDaSemana
  );
  if (!horarioDoDia || !horarioDoDia.ativo) {
    return [];
  }

  const workStart = parseInt(horarioDoDia.hora_inicio.split(":")[0]);
  const endHour = parseInt(horarioDoDia.hora_fim.split(":")[0]);
  const endMinute = parseInt(horarioDoDia.hora_fim.split(":")[1]);
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

      if (
        slotEnd.getHours() > endHour ||
        (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMinute)
      ) {
        continue;
      }

      let isBlocked = false;
      for (const block of existingBlocks) {
        const blockStart = new Date(block.data_inicio);
        const blockEnd = new Date(block.data_fim);

        if (
          (slotStart >= blockStart && slotStart < blockEnd) ||
          (slotEnd > blockStart && slotEnd <= blockEnd) ||
          (slotStart <= blockStart && slotEnd >= blockEnd)
        ) {
          if (
            block.barbeiro_id === null ||
            (barbeiroId && block.barbeiro_id === barbeiroId)
          ) {
            isBlocked = true;
            break;
          }
        }
      }
      if (isBlocked) {
        continue;
      }

      const conflictingAppointments = existingAppointments.filter(
        (appointment) => {
          const existingStart = new Date(appointment.data_hora_inicio);
          const existingEnd = new Date(appointment.data_hora_fim);
          // A mesma lógica de conflito: (StartA < EndB) AND (EndA > StartB)
          return slotStart < existingEnd && slotEnd > existingStart;
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
