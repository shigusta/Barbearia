import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { db } from "./db";
import {
  horariosFuncionamento,
  barbeiros as tabelaBarbeiros,
} from "../shared/schema";
import * as bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await seedInitialData();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5000;
  const host = "127.0.0.1";
  server.listen(
    {
      port,
      host: host,
      //  reusePort: true, //
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();

// Seed initial data
async function seedInitialData() {
  try {
    const adminUser = await storage.getUserByUsername("admin");
    if (adminUser) {
      console.log("Data already exists. Skipping seed.");
      return;
    }

    console.log("Seeding initial data for the first time...");

    // Cria o usuário admin usando bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
    });
    console.log("Admin user created successfully.");

    // Cria os barbeiros
    await storage.createBarbeiro({ nome: "João Silva", ativo: true });
    await storage.createBarbeiro({ nome: "Pedro Santos", ativo: true });
    console.log("Default barbers seeded successfully.");

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
      },
      {
        dia_da_semana: 1,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      },
      {
        dia_da_semana: 2,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      },
      {
        dia_da_semana: 3,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      },
      {
        dia_da_semana: 4,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      },
      {
        dia_da_semana: 5,
        hora_inicio: "09:00",
        hora_fim: "19:00",
        ativo: true,
      },
      {
        dia_da_semana: 6,
        hora_inicio: "09:00",
        hora_fim: "17:00",
        ativo: true,
      },
    ];
    await db.insert(horariosFuncionamento).values(horariosParaInserir);

    console.log("Default operating hours seeded successfully.");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}
