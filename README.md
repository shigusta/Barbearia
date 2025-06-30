# 💈 Elite Barber System

Sistema completo de agendamento online para barbearias com painel administrativo e design responsivo.

## 🎯 Visão Geral

Este é um template profissional para barbearias que permite:
- Agendamento online 24/7
- Painel administrativo completo
- Design moderno e responsivo
- Sistema de validação e confirmação
- Gestão de barbeiros e serviços

## 🚀 Acesso Rápido

### 🌐 Site Principal
- **URL**: [Seu domínio aqui]
- **Páginas**: Início, Serviços, Agendamento, Contato

### 👨‍💼 Painel Administrativo
- **URL**: `/admin`
- **Senha padrão**: `admin123`
- **Funcionalidades**: Gerenciar agendamentos, visualizar relatórios

## 📁 Estrutura do Projeto

```
elite-barber-system/
├── 📖 docs/                          # Documentação completa
│   ├── DOCUMENTACAO_COMPLETA.md      # Documentação técnica
│   ├── GUIA_COMERCIALIZACAO.md       # Estratégias de venda
│   ├── PERSONALIZACAO_CLIENTE.md     # Como personalizar
│   └── APRESENTACAO_COMERCIAL.md     # Scripts de vendas
├── 🎨 assets/                        # Arquivos de apresentação
│   └── template-apresentacao.html    # Demo visual
├── 🔧 scripts/                       # Utilitários
│   ├── personalizar.js               # Script de personalização
│   └── backup.sh                     # Script de backup
├── 💻 client/                        # Frontend React
├── 🗄️  server/                       # Backend Express
├── 🔗 shared/                        # Código compartilhado
└── 📋 package.json                   # Dependências
```

## ⚡ Comandos Rápidos

```bash
# Iniciar desenvolvimento
npm run dev

# Atualizar banco de dados
npm run db:push

# Fazer backup
./scripts/backup.sh

# Personalizar para cliente
node scripts/personalizar.js config-cliente.json
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 + TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query
- React Hook Form + Zod

### Backend
- Node.js + Express
- Drizzle ORM
- PostgreSQL (Neon)
- TypeScript

## 📊 Funcionalidades Principais

### ✅ Sistema de Agendamento
- [x] Seleção de serviços
- [x] Escolha de barbeiro (opcional)
- [x] Calendário com horários disponíveis
- [x] Formulário de dados do cliente
- [x] Confirmação e validação

### ✅ Painel Administrativo
- [x] Visualização de agendamentos
- [x] Alteração de status
- [x] Cancelamento de agendamentos
- [x] Relatórios básicos

### ✅ Design e UX
- [x] Layout responsivo
- [x] Tema escuro elegante
- [x] Animações suaves
- [x] Validação em tempo real

## 🎨 Personalização

Para personalizar o sistema para cada cliente:

1. **Coleta de dados**: Use os formulários em `/docs/`
2. **Configuração**: Execute `scripts/personalizar.js`
3. **Banco de dados**: Insira serviços e barbeiros
4. **Teste**: Valide todas as funcionalidades

Ver [documentação completa](docs/PERSONALIZACAO_CLIENTE.md) para detalhes.

## 💰 Comercialização

Este template pode ser vendido para barbearias locais:

- **Pacote Básico**: R$ 497 (barbeiros autônomos)
- **Pacote Profissional**: R$ 897 (barbearias estabelecidas)  
- **Pacote Premium**: R$ 1.497 (redes de barbearias)

Ver [guia de comercialização](docs/GUIA_COMERCIALIZACAO.md) para estratégias completas.

## 📚 Documentação

- 📖 **[Documentação Técnica](docs/DOCUMENTACAO_COMPLETA.md)** - Arquitetura e APIs
- 💼 **[Guia Comercial](docs/GUIA_COMERCIALIZACAO.md)** - Como vender o template
- 🎨 **[Personalização](docs/PERSONALIZACAO_CLIENTE.md)** - Customização para clientes
- 🎯 **[Apresentação](docs/APRESENTACAO_COMERCIAL.md)** - Scripts de vendas

## 🐛 Solução de Problemas

### Problema no Agendamento
- Verificar logs do servidor
- Validar formato das datas
- Confirmar dados obrigatórios

### Banco Não Conecta
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Aplicar schema
npm run db:push
```

### Estilos Não Carregam
```bash
# Limpar cache
rm -rf node_modules/.vite
npm run dev
```

## 🔐 Segurança

- Validação completa de dados (frontend + backend)
- Sanitização de inputs do usuário
- Constraints de banco de dados
- Rate limiting nas APIs críticas

## 🚀 Deploy

1. **Configurar variáveis de ambiente**
2. **Executar build**: `npm run build`
3. **Aplicar schema**: `npm run db:push`
4. **Verificar funcionalidades**

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Notificações WhatsApp
- [ ] Integração Google Calendar
- [ ] Sistema de avaliações
- [ ] Relatórios avançados

### Melhorias Futuras
- [ ] App mobile
- [ ] Pagamento online
- [ ] Multi-localização
- [ ] API pública

## 📞 Suporte

- **WhatsApp**: [Seu número]
- **Email**: [Seu email]
- **Horário**: Segunda a Sexta, 9h às 18h

---

**Desenvolvido com ❤️ para barbeiros modernos**

*Última atualização: Junho 2025*