import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgendamentoSchema } from "@shared/schema";
import { z } from "zod";

// Validation schemas
const createAgendamentoSchema = insertAgendamentoSchema.extend({
  nome_cliente: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone_cliente: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email_cliente: z.string().email("Email inválido"),
});

const horariosDisponiveisSchema = z.object({
  data: z.string().transform(str => new Date(str)),
  servico_id: z.string().transform(str => parseInt(str)),
  barbeiro_id: z.string().transform(str => parseInt(str)).optional(),
});

const contactFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data
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
          errors: validation.error.errors 
        });
      }

      const { data, servico_id, barbeiro_id } = validation.data;
      
      const servico = await storage.getServicoById(servico_id);
      if (!servico) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      // Get existing appointments for the date
      const agendamentosExistentes = await storage.getAgendamentosByDate(data, barbeiro_id);
      
      // Generate available time slots
      const horariosDisponiveis = generateAvailableTimeSlots(
        data,
        servico.duracao_minutos,
        agendamentosExistentes
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
      const validation = createAgendamentoSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: validation.error.errors 
        });
      }

      const agendamentoData = validation.data;

      // Check if the time slot is still available
      const conflictingAppointments = await storage.getAgendamentosByDate(
        agendamentoData.data_hora_inicio,
        agendamentoData.barbeiro_id
      );

      const hasConflict = conflictingAppointments.some(existing => {
        const existingStart = new Date(existing.data_hora_inicio);
        const existingEnd = new Date(existing.data_hora_fim);
        const newStart = new Date(agendamentoData.data_hora_inicio);
        const newEnd = new Date(agendamentoData.data_hora_fim);

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (hasConflict) {
        return res.status(409).json({ 
          message: "Desculpe, este horário acabou de ser preenchido. Por favor, escolha outro horário." 
        });
      }

      const agendamento = await storage.createAgendamento(agendamentoData);
      res.status(201).json({ 
        message: "Agendamento realizado com sucesso!",
        agendamento 
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
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

      if (!status || !["confirmado", "cancelado", "concluido"].includes(status)) {
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
          errors: validation.error.errors 
        });
      }

      // In a real implementation, you would send an email or save to database
      console.log("Contact form submission:", validation.data);
      
      res.json({ message: "Mensagem enviada com sucesso! Entraremos em contato em breve." });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate available time slots
function generateAvailableTimeSlots(
  date: Date,
  durationMinutes: number,
  existingAppointments: any[]
) {
  const slots = [];
  const workStart = 9; // 9:00 AM
  const workEnd = 19; // 7:00 PM
  const slotInterval = 15; // 15-minute intervals

  // Skip Sundays
  if (date.getDay() === 0) {
    return slots;
  }

  // Saturday has different hours
  const endHour = date.getDay() === 6 ? 17 : workEnd; // Saturday until 5:00 PM

  for (let hour = workStart; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      // Check if slot end time is within working hours
      if (slotEnd.getHours() >= endHour) {
        continue;
      }

      // Check for conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const existingStart = new Date(appointment.data_hora_inicio);
        const existingEnd = new Date(appointment.data_hora_fim);

        return (
          (slotStart >= existingStart && slotStart < existingEnd) ||
          (slotEnd > existingStart && slotEnd <= existingEnd) ||
          (slotStart <= existingStart && slotEnd >= existingEnd)
        );
      });

      if (!hasConflict) {
        slots.push({
          inicio: slotStart.toISOString(),
          fim: slotEnd.toISOString(),
          display: `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`
        });
      }
    }
  }

  return slots;
}

// Seed initial data
async function seedInitialData() {
  try {
    // Check if data already exists
    const existingServices = await storage.getServicos();
    if (existingServices.length > 0) {
      return; // Data already seeded
    }

    // Create barbers
    const barbeiro1 = await storage.createBarbeiro({
      nome: "João Silva",
      ativo: true
    });

    const barbeiro2 = await storage.createBarbeiro({
      nome: "Pedro Santos",
      ativo: true
    });

    // Create services
    await storage.createServico({
      nome: "Corte Tradicional",
      descricao: "Corte personalizado com técnicas clássicas e modernas, adaptado ao seu estilo e formato do rosto.",
      duracao_minutos: 45,
      preco: "45.00",
      ativo: true
    });

    await storage.createServico({
      nome: "Barba Terapia",
      descricao: "Tratamento completo com aparação, modelagem e hidratação profunda usando produtos premium.",
      duracao_minutos: 30,
      preco: "35.00",
      ativo: true
    });

    await storage.createServico({
      nome: "Combo Completo",
      descricao: "Corte + Barba + Sobrancelha. O pacote completo para um visual impecável e renovado.",
      duracao_minutos: 90,
      preco: "75.00",
      ativo: true
    });

    await storage.createServico({
      nome: "Sobrancelha",
      descricao: "Aparação e design profissional das sobrancelhas.",
      duracao_minutos: 15,
      preco: "20.00",
      ativo: true
    });

    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}
