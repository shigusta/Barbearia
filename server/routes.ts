import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgendamentoSchema } from "@shared/schema";
import { z } from "zod";
import { isToday, set } from "date-fns";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./auth";

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

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function registerRoutes(app: Express): Promise<Server> {
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

      // --- LÓGICA DE GERAÇÃO DE TOKEN ---
      // 1. Pega o segredo do .env
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET não definido no .env");
      }

      // 2. Cria o "payload" do token (as informações que queremos guardar nele)
      const payload = {
        userId: user.id,
        username: user.username,
      };

      // 3. Gera o token, que expira em 1 dia (86400 segundos)
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });

      // 4. Retorna o token para o frontend
      res.json({
        message: "Login realizado com sucesso!",
        token: token,
      });
      // --- FIM DA LÓGICA DE TOKEN ---
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  });

  // Create appointment
  app.post("/api/agendar", async (req, res) => {
    try {
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

      // --- LÓGICA DE VERIFICAÇÃO DE CONFLITO CORRIGIDA ---

      const agendamentosConflitantes =
        await storage.getAgendamentosPorIntervalo(
          agendamentoData.data_hora_inicio,
          agendamentoData.data_hora_fim
        );

      if (agendamentoData.barbeiro_id) {
        // CENÁRIO 1: Cliente escolheu um barbeiro específico.
        const temConflito = agendamentosConflitantes.some(
          (ag) => ag.barbeiro_id === agendamentoData.barbeiro_id
        );

        if (temConflito) {
          return res
            .status(409)
            .json({ message: "Este barbeiro já está ocupado neste horário." });
        }
      } else {
        // CENÁRIO 2: Cliente escolheu "Qualquer Barbeiro".
        const barbeirosAtivos = await storage.getBarbeiros();

        if (agendamentosConflitantes.length >= barbeirosAtivos.length) {
          // Se o número de agendamentos no horário for igual ou maior que o de barbeiros, o horário está cheio.
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
          return res.status(409).json({
            message: "Não foi possível encontrar um barbeiro disponível.",
          });
        }

        // Atribui o agendamento ao barbeiro livre que foi encontrado!
        agendamentoData.barbeiro_id = barbeiroLivre.id;
      }
      // --- FIM DA LÓGICA CORRIGIDA ---

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
  app.get("/api/agendamentos", authenticateToken, async (req, res) => {
    try {
      const agendamentos = await storage.getAgendamentos();
      res.json(agendamentos);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Update appointment status (admin)
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

        await storage.updateAgendamentoStatus(id, status);
        res.json({ message: "Status atualizado com sucesso" });
      } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  );

  // Delete appointment (admin)
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
