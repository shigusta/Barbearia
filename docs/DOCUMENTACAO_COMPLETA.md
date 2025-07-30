# 📚 Documentação Completa - Sistema de Barbearia

## 🎯 Visão Geral

Este é um sistema completo de agendamento online para barbearias, desenvolvido com tecnologias modernas e foco na experiência do usuário. O sistema permite que clientes agendem serviços online 24/7 e oferece um painel administrativo completo para gerenciamento.

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **Wouter** para roteamento
- **TanStack Query** para gerenciamento de estado do servidor
- **React Hook Form** com validação Zod
- **Date-fns** para manipulação de datas

#### Backend
- **Node.js** com Express.js
- **TypeScript** para type safety
- **Drizzle ORM** para database operations
- **Zod** para validação de dados
- **PostgreSQL** como banco de dados

#### Infraestrutura
- **Vite** como build tool
- **Neon** para PostgreSQL serverless
- **Render** e **Vercel** para deploy

### Estrutura de Diretórios

```
/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── booking/    # Componentes do agendamento
│   │   │   ├── layout/     # Header, Footer
│   │   │   └── ui/         # Componentes Shadcn
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários e configurações
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── utils/          # Ferramentes utilitarias
│   │   ├── App.tsx         # Componente principal
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Estilos globais
│   └── index.html          # Template HTML
├── docs/                   # Todos os documentos para comercialização
├── server/                 # Backend Express
│   ├── auth.ts             # Autenticação página admin
│   ├── db.ts               # Configuração do banco
│   ├── index.ts            # Entry point do servidor
│   ├── notifications.ts    # Integração com notificações WhatsApp
│   ├── routes.ts           # Definição das rotas da API
│   ├── storage.ts          # Camada de acesso aos dados
│   └── vite.ts             # Integração com Vite
├── shared/                 # Código compartilhado
│   └── schema.ts           # Schemas do banco e validação
├── package.json            # Dependências
├── drizzle.config.ts       # Configuração do Drizzle
├── vite.config.ts          # Configuração do Vite
├── tailwind.config.ts      # Configuração do Tailwind
└── README.md               # Apresentação do projeto
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

#### barbeiros
```sql
CREATE TABLE barbeiros (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true
);
```

#### servicos
```sql
CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true
);
```

#### agendamentos
```sql
CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  servico_id INTEGER REFERENCES servicos(id),
  barbeiro_id INTEGER REFERENCES barbeiros(id),
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  telefone_cliente VARCHAR(20) NOT NULL,
  email_cliente VARCHAR(255),
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'agendado',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relacionamentos
- `agendamentos.servico_id → servicos.id` (muitos para um)
- `agendamentos.barbeiro_id → barbeiros.id` (muitos para um)
- `servicos` tem muitos `agendamentos`
- `barbeiros` tem muitos `agendamentos`

## 🌐 API Endpoints

### Serviços
- `GET /api/servicos` - Lista todos os serviços ativos
- `POST /api/servicos` - Cria novo serviço (admin)

### Barbeiros  
- `GET /api/barbeiros` - Lista todos os barbeiros ativos
- `POST /api/barbeiros` - Cria novo barbeiro (admin)

### Agendamentos
- `GET /api/agendamentos` - Lista todos os agendamentos
- `POST /api/agendar` - Cria novo agendamento
- `PATCH /api/agendamentos/:id/status` - Atualiza status do agendamento
- `DELETE /api/agendamentos/:id` - Cancela agendamento

### Horários
- `GET /api/horarios-disponiveis` - Lista horários disponíveis
  - Query params: `data`, `servico_id`, `barbeiro_id`

### Contato
- `POST /api/contato` - Envia mensagem de contato

## 📱 Funcionalidades Principais

### Sistema de Agendamento (5 Etapas)

#### 1. Seleção de Serviço
- Lista todos os serviços disponíveis
- Exibe preço e duração
- Permite seleção única

#### 2. Seleção de Barbeiro (Opcional)
- Lista barbeiros disponíveis
- Se não selecionado, sistema escolhe automaticamente
- Exibe especialidades

#### 3. Seleção de Data e Horário
- Calendar picker para data
- Lista de horários disponíveis baseada na duração do serviço
- Verificação de conflitos em tempo real
- Desabilita datas passadas e domingos

#### 4. Informações do Cliente
- Nome completo (obrigatório)
- Telefone (obrigatório)
- Email (opcional)
- Observações (opcional)
- Validação de campos

#### 5. Confirmação
- Resumo completo do agendamento
- Informações importantes (pontualidade, cancelamento)
- Botão de confirmação final

### Painel Administrativo

#### Acesso
- URL: `/admin`
- Senha padrão: `admin123`

#### Funcionalidades
- **Dashboard**: Visão geral dos agendamentos
- **Agendamentos**: Lista completa com filtros
- **Status**: Confirmar, cancelar ou remarcar
- **Relatórios**: Estatísticas básicas

## 🎨 Design System

### Cores Principais
```css
--primary: #D4AF37      /* Dourado */
--secondary: #1A1A1A    /* Preto */
--accent: #B8860B       /* Dourado escuro */
--background: #0A0A0A   /* Preto profundo */
--text: #FFFFFF         /* Branco */
--muted: #6B7280        /* Cinza */
```

### Tipografia
- **Títulos**: Playfair Display (serif elegante)
- **Corpo**: Inter (sans-serif moderna)
- **Botões**: Inter com peso bold

### Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid e Flexbox

## ⚙️ Configuração e Instalação

### Pré-requisitos
```bash
Node.js 18+
PostgreSQL
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://user:password@host:port/database
PGUSER=postgres
PGHOST=localhost
PGDATABASE=barbershop
PGPASSWORD=password
PGPORT=5432
```

### Comandos de Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Push do schema para o banco
npm run db:push

# Build para produção
npm run build
```

### Estrutura de Scripts
```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build --outDir dist/public",
  "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:pg-native",
  "db:push": "drizzle-kit push"
}
```

## 🔧 Personalização para Clientes

### Dados Básicos a Coletar

#### Informações da Empresa
```json
{
  "nome": "Nome da Barbearia",
  "slogan": "Slogan da empresa",
  "endereco": "Endereço completo",
  "telefone": "(11) 99999-9999",
  "whatsapp": "5511999999999",
  "email": "contato@barbearia.com",
  "instagram": "@barbearia",
  "horarios": {
    "segunda": "09:00 - 19:00",
    "terca": "09:00 - 19:00",
    // ...
  }
}
```

#### Serviços
```json
{
  "servicos": [
    {
      "nome": "Corte Tradicional",
      "descricao": "Corte clássico masculino",
      "preco": 35.00,
      "duracao": 45
    }
    // ...
  ]
}
```

#### Barbeiros
```json
{
  "barbeiros": [
    {
      "nome": "João Silva",
      "especialidade": "Cortes clássicos"
    }
    // ...
  ]
}
```

### Processo de Personalização

#### 1. Coleta de Dados (Dia 1-2)
- Usar formulário padronizado
- Coletar logos e fotos
- Definir identidade visual

#### 2. Configuração (Dia 3-7)
- Atualizar cores e tipografia
- Inserir dados no banco
- Personalizar textos

#### 3. Testes (Dia 8-10)
- Verificar responsividade
- Testar fluxo de agendamento
- Validar informações

#### 4. Entrega (Dia 11-14)
- Treinamento da equipe
- Documentação de uso
- Suporte inicial

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro no Agendamento
**Sintoma**: Erro 400 com "Dados inválidos"
**Causa**: Problema na validação de dados de data/hora
**Solução**: 
```javascript
// Verificar formato das datas no frontend
const bookingData = {
  ...data,
  data_hora_inicio: new Date(data.data_hora_inicio),
  data_hora_fim: new Date(data.data_hora_fim)
};
```

#### Banco de Dados Não Conecta
**Sintoma**: Erro de conexão PostgreSQL
**Causa**: URL de conexão inválida ou banco indisponível
**Solução**:
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Testar conexão
npm run db:push
```

#### Estilos Não Carregam
**Sintoma**: Layout quebrado, sem estilos
**Causa**: Problema no build do Tailwind
**Solução**:
```bash
# Limpar cache e rebuildar
rm -rf node_modules/.vite
npm run dev
```

#### Horários Não Aparecem
**Sintoma**: Lista de horários vazia
**Causa**: Lógica de geração de slots
**Solução**: Verificar se a data selecionada não é passada e se há barbeiros ativos

### Logs e Debug

#### Habilitar Logs Detalhados
```javascript
// server/routes.ts
console.log("Received booking data:", req.body);
console.log("Validation errors:", validation.error.errors);
```

#### Verificar Estado do Sistema
```bash
# Status do banco
npm run db:push

# Logs do servidor
tail -f logs/server.log

# Verificar porta
netstat -an | grep 5000
```

## 📊 Monitoramento e Analytics

### Métricas Importantes
- **Taxa de Conversão**: Visitantes → Agendamentos
- **Taxa de No-Show**: Agendamentos → Comparecimentos
- **Horários Mais Populares**: Análise de demanda
- **Serviços Mais Solicitados**: Ranking de serviços

### Como Implementar Analytics
```javascript
// Google Analytics 4
gtag('event', 'appointment_started', {
  service_id: serviceId,
  barber_id: barberId
});

gtag('event', 'appointment_completed', {
  service_id: serviceId,
  value: servicePrice
});
```

## 🔐 Segurança

### Validação de Dados
- **Frontend**: React Hook Form + Zod
- **Backend**: Zod schemas em todas as rotas
- **Database**: Constraints e foreign keys

### Sanitização
```javascript
// Sanitizar inputs do usuário
const sanitizedData = {
  nome_cliente: data.nome_cliente.trim(),
  telefone_cliente: data.telefone_cliente.replace(/\D/g, ''),
  email_cliente: data.email_cliente?.toLowerCase().trim()
};
```

### Rate Limiting
```javascript
// Implementar rate limiting para agendamentos
const rateLimit = require('express-rate-limit');

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // máximo 5 agendamentos por IP
});

app.use('/api/agendar', bookingLimiter);
```

## 🚀 Deploy e Produção

### Build para Produção
```bash
# 1. Build da aplicação
npm run build

# 2. Push do schema
npm run db:push

# 3. Verificar arquivos gerados
ls -la dist/
```

### Variáveis de Ambiente Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
PORT=5000
```

### Checklist de Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados provisionado
- [ ] Schema aplicado (`npm run db:push`)
- [ ] Build executado sem erros
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo

## 📈 Roadmap de Melhorias

### Versão 1.1 (Próximas Funcionalidades)
- [ ] Sistema de notificações por WhatsApp
- [ ] Integração com Google Calendar
- [ ] Relatórios avançados
- [ ] Sistema de avaliações

### Versão 1.2 (Funcionalidades Avançadas)
- [ ] App mobile (React Native)
- [ ] Sistema de fidelidade
- [ ] Pagamento online
- [ ] Multi-localização

### Versão 2.0 (Escalabilidade)
- [ ] Multi-tenancy
- [ ] API pública
- [ ] Integrações de terceiros
- [ ] Dashboard analytics avançado

## 📞 Suporte Técnico

### Contatos de Suporte
- **Email**: suporte@barbersystem.com.br
- **WhatsApp**: (11) 99999-9999
- **Horário**: Segunda a Sexta, 9h às 18h

### Como Reportar Bugs
1. Descrever o problema detalhadamente
2. Incluir prints da tela
3. Informar navegador e dispositivo
4. Passos para reproduzir o erro

### Atualizações
- **Patches de Segurança**: Imediatas
- **Correções de Bugs**: Semanais
- **Novas Funcionalidades**: Mensais

---

## 📝 Changelog

### v1.0.0 (30/06/2025)
- ✅ Sistema completo de agendamento online
- ✅ Painel administrativo
- ✅ Design responsivo
- ✅ Validação completa de dados
- ✅ Integração com PostgreSQL
- ✅ Deploy automatizado

### Próximas Versões
- 🔄 Notificações WhatsApp
- 🔄 Relatórios avançados
- 🔄 Sistema de avaliações

---

**Esta documentação é atualizada constantemente. Última atualização: 30/07/2025**