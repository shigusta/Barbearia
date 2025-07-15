import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const horariosFuncionamento = pgTable("horarios_funcionamento", {
  id: serial("id").primaryKey(),
  dia_da_semana: integer("dia_da_semana").notNull(), // 0 para Domingo, 1 para Segunda, etc.
  hora_inicio: text("hora_inicio").notNull(), // Formato "HH:mm"
  hora_fim: text("hora_fim").notNull(), // Formato "HH:mm"
  ativo: boolean("ativo").default(true),
});

export type HorarioFuncionamento = typeof horariosFuncionamento.$inferSelect;

export const barbeiros = pgTable("barbeiros", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
});

export const servicos = pgTable("servicos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  duracao_minutos: integer("duracao_minutos").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
});

export const agendamentos = pgTable("agendamentos", {
  id: serial("id").primaryKey(),
  nome_cliente: text("nome_cliente").notNull(),
  telefone_cliente: text("telefone_cliente").notNull(),
  email_cliente: text("email_cliente").notNull(),
  servico_id: integer("servico_id")
    .references(() => servicos.id)
    .notNull(),
  barbeiro_id: integer("barbeiro_id")
    .references(() => barbeiros.id)
    .notNull(),
  data_hora_inicio: timestamp("data_hora_inicio").notNull(),
  data_hora_fim: timestamp("data_hora_fim").notNull(),
  status: text("status").default("confirmado").notNull(),
  observacoes: text("observacoes"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
});

export const agendamentosRelations = relations(agendamentos, ({ one }) => ({
  servico: one(servicos, {
    fields: [agendamentos.servico_id],
    references: [servicos.id],
  }),
  barbeiro: one(barbeiros, {
    fields: [agendamentos.barbeiro_id],
    references: [barbeiros.id],
  }),
}));

export const servicosRelations = relations(servicos, ({ many }) => ({
  agendamentos: many(agendamentos),
}));

export const barbeirosRelations = relations(barbeiros, ({ many }) => ({
  agendamentos: many(agendamentos),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBarbeiroSchema = createInsertSchema(barbeiros).omit({
  id: true,
});

export const insertServicoSchema = createInsertSchema(servicos).omit({
  id: true,
});

export const insertAgendamentoSchema = createInsertSchema(agendamentos).omit({
  id: true,
  criado_em: true,
});

export const bloqueiosAgenda = pgTable("bloqueios_agenda", {
  id: serial("id").primaryKey(),
  data_inicio: timestamp("data_inicio", { withTimezone: true }).notNull(),
  data_fim: timestamp("data_fim", { withTimezone: true }).notNull(),
  motivo: text("motivo"), // Ex: "Almoço", "Férias", "Feriado"

  // Se o barbeiro_id for nulo, o bloqueio se aplica a toda a barbearia.
  // Se tiver um ID, o bloqueio é apenas para aquele barbeiro.
  barbeiro_id: integer("barbeiro_id").references(() => barbeiros.id),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Barbeiro = typeof barbeiros.$inferSelect;
export type InsertBarbeiro = z.infer<typeof insertBarbeiroSchema>;
export type Servico = typeof servicos.$inferSelect;
export type InsertServico = z.infer<typeof insertServicoSchema>;
export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertAgendamento = z.infer<typeof insertAgendamentoSchema>;
export type BloqueioAgenda = typeof bloqueiosAgenda.$inferSelect;
export type InsertBloqueioAgenda = typeof bloqueiosAgenda.$inferInsert;

// Extended types with relationships
export type AgendamentoComRelacoes = Agendamento & {
  servico: Servico;
  barbeiro: Barbeiro;
};
