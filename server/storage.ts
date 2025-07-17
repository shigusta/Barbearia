import {
  users,
  barbeiros,
  servicos,
  agendamentos,
  horariosFuncionamento,
  bloqueiosAgenda,
  type User,
  type InsertUser,
  type Barbeiro,
  type InsertBarbeiro,
  type Servico,
  type InsertServico,
  type Agendamento,
  type InsertAgendamento,
  type AgendamentoComRelacoes,
  type HorarioFuncionamento,
  type BloqueioAgenda,
  type InsertBloqueioAgenda,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, lt, gt, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Barbeiros
  getBarbeiros(): Promise<Barbeiro[]>;
  getBarbeiroById(id: number): Promise<Barbeiro | undefined>;
  createBarbeiro(barbeiro: InsertBarbeiro): Promise<Barbeiro>;

  // Servicos
  getServicos(): Promise<Servico[]>;
  getServicoById(id: number): Promise<Servico | undefined>;
  createServico(servico: InsertServico): Promise<Servico>;

  // Agendamentos
  getAgendamentos(): Promise<AgendamentoComRelacoes[]>;
  getAgendamentoById(id: number): Promise<AgendamentoComRelacoes | undefined>;
  getAgendamentosByDate(
    data: Date,
    barbeiroId?: number
  ): Promise<AgendamentoComRelacoes[]>;
  createAgendamento(agendamento: InsertAgendamento): Promise<Agendamento>;
  updateAgendamentoStatus(id: number, status: string): Promise<void>;
  deleteAgendamento(id: number): Promise<void>;
  getAgendamentosPorIntervalo(inicio: Date, fim: Date): Promise<Agendamento[]>;

  // Horario Funcionamento
  getHorarioDeFuncionamentoPorDia(
    dia: number
  ): Promise<HorarioFuncionamento | undefined>;

  // Bloqueios
  createBloqueio(bloqueio: InsertBloqueioAgenda): Promise<BloqueioAgenda>;
  getBloqueiosPorPeriodo(inicio: Date, fim: Date): Promise<BloqueioAgenda[]>;
  getBloqueios(): Promise<BloqueioAgenda[]>; //
  deleteBloqueio(id: number): Promise<void>;

  //Bloqueio Varios Agendamentos
  countFutureAppointmentsByPhone(telefone: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Barbeiros
  async getBarbeiros(): Promise<Barbeiro[]> {
    return await db.select().from(barbeiros).where(eq(barbeiros.ativo, true));
  }

  async getBarbeiroById(id: number): Promise<Barbeiro | undefined> {
    const [barbeiro] = await db
      .select()
      .from(barbeiros)
      .where(eq(barbeiros.id, id));
    return barbeiro || undefined;
  }

  async createBarbeiro(insertBarbeiro: InsertBarbeiro): Promise<Barbeiro> {
    const [barbeiro] = await db
      .insert(barbeiros)
      .values(insertBarbeiro)
      .returning();
    return barbeiro;
  }

  // Servicos
  async getServicos(): Promise<Servico[]> {
    return await db.select().from(servicos).where(eq(servicos.ativo, true));
  }

  async getServicoById(id: number): Promise<Servico | undefined> {
    const [servico] = await db
      .select()
      .from(servicos)
      .where(eq(servicos.id, id));
    return servico || undefined;
  }

  async createServico(insertServico: InsertServico): Promise<Servico> {
    const [servico] = await db
      .insert(servicos)
      .values(insertServico)
      .returning();
    return servico;
  }

  // Horarios de Funcionamento
  async getHorarioDeFuncionamentoPorDia(
    diaDaSemana: number
  ): Promise<HorarioFuncionamento | undefined> {
    const [horario] = await db
      .select()
      .from(horariosFuncionamento)
      .where(eq(horariosFuncionamento.dia_da_semana, diaDaSemana));

    return horario || undefined;
  }

  // Agendamentos
  async getAgendamentos(): Promise<AgendamentoComRelacoes[]> {
    return await db
      .select()
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servico_id, servicos.id))
      .innerJoin(barbeiros, eq(agendamentos.barbeiro_id, barbeiros.id))
      .orderBy(desc(agendamentos.data_hora_inicio))
      .then((rows) =>
        rows.map((row) => ({
          ...row.agendamentos,
          servico: row.servicos,
          barbeiro: row.barbeiros,
        }))
      );
  }

  async getAgendamentoById(
    id: number
  ): Promise<AgendamentoComRelacoes | undefined> {
    const [result] = await db
      .select()
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servico_id, servicos.id))
      .innerJoin(barbeiros, eq(agendamentos.barbeiro_id, barbeiros.id))
      .where(eq(agendamentos.id, id));

    if (!result) return undefined;

    return {
      ...result.agendamentos,
      servico: result.servicos,
      barbeiro: result.barbeiros,
    };
  }

  async getAgendamentosPorIntervalo(
    inicio: Date,
    fim: Date,
    barbeiroId?: number
  ): Promise<Agendamento[]> {
    const conditions = [
      lt(agendamentos.data_hora_inicio, fim),
      gt(agendamentos.data_hora_fim, inicio),
    ];

    if (barbeiroId) {
      conditions.push(eq(agendamentos.barbeiro_id, barbeiroId));
    }

    return db
      .select()
      .from(agendamentos)
      .where(and(...conditions));
  }

  async getAgendamentosByDate(
    data: Date,
    barbeiroId?: number
  ): Promise<AgendamentoComRelacoes[]> {
    const startOfDay = new Date(data);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(data);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const whereConditions = barbeiroId
      ? and(
          gte(agendamentos.data_hora_inicio, startOfDay),
          lte(agendamentos.data_hora_inicio, endOfDay),
          eq(agendamentos.barbeiro_id, barbeiroId)
        )
      : and(
          gte(agendamentos.data_hora_inicio, startOfDay),
          lte(agendamentos.data_hora_inicio, endOfDay)
        );

    const query = db
      .select()
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servico_id, servicos.id))
      .innerJoin(barbeiros, eq(agendamentos.barbeiro_id, barbeiros.id))
      .where(whereConditions);

    return await query.then((rows) =>
      rows.map((row) => ({
        ...row.agendamentos,
        servico: row.servicos,
        barbeiro: row.barbeiros,
      }))
    );
  }

  async createAgendamento(
    insertAgendamento: InsertAgendamento
  ): Promise<Agendamento> {
    const [agendamento] = await db
      .insert(agendamentos)
      .values(insertAgendamento)
      .returning();
    return agendamento;
  }

  async updateAgendamentoStatus(id: number, status: string): Promise<void> {
    await db
      .update(agendamentos)
      .set({ status })
      .where(eq(agendamentos.id, id));
  }

  async deleteAgendamento(id: number): Promise<void> {
    await db.delete(agendamentos).where(eq(agendamentos.id, id));
  }

  // Bloqueios de Agenda
  async createBloqueio(
    bloqueio: InsertBloqueioAgenda
  ): Promise<BloqueioAgenda> {
    const [novoBloqueio] = await db
      .insert(bloqueiosAgenda)
      .values(bloqueio)
      .returning();
    return novoBloqueio;
  }

  async getBloqueiosPorPeriodo(
    inicio: Date,
    fim: Date
  ): Promise<BloqueioAgenda[]> {
    return await db
      .select()
      .from(bloqueiosAgenda)
      .where(
        and(
          lt(bloqueiosAgenda.data_inicio, fim),
          gt(bloqueiosAgenda.data_fim, inicio)
        )
      );
  }

  // ✅ NOVO MÉTODO: Listar todos os bloqueios
  async getBloqueios(): Promise<BloqueioAgenda[]> {
    return await db
      .select()
      .from(bloqueiosAgenda)
      .orderBy(desc(bloqueiosAgenda.data_inicio));
  }

  // ✅ NOVO MÉTODO: Apagar um bloqueio por ID
  async deleteBloqueio(id: number): Promise<void> {
    await db.delete(bloqueiosAgenda).where(eq(bloqueiosAgenda.id, id));
  }

  // Bloqueio Varios Agendamentos
  async countFutureAppointmentsByPhone(telefone: string): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(agendamentos)
      .where(
        and(
          eq(agendamentos.telefone_cliente, telefone),
          eq(agendamentos.status, "confirmado"),
          gt(agendamentos.data_hora_inicio, new Date()) //Apenas agendamento no futuro
        )
      );

    return result[0].value;
  }
}

export const storage = new DatabaseStorage();
