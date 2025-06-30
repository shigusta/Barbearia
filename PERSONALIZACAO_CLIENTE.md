# 🎨 Sistema de Personalização para Clientes

## Arquivo de Configuração do Cliente

### Como Personalizar para Cada Barbearia

1. **Crie uma cópia deste arquivo** para cada cliente: `config-[nome-barbearia].json`
2. **Preencha os dados** conforme as informações coletadas
3. **Execute o script** de personalização automática

### Exemplo de Arquivo de Configuração

```json
{
  "empresa": {
    "nome": "Barbearia Elite",
    "slogan": "Tradição e Estilo desde 1985",
    "endereco": {
      "rua": "Rua das Flores, 123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "cep": "01234-567",
      "maps_url": "https://maps.google.com/..."
    },
    "contato": {
      "telefone": "(11) 99999-9999",
      "whatsapp": "5511999999999",
      "email": "contato@barbeariaelite.com.br",
      "instagram": "@barbeariaelite",
      "facebook": "BarbeariaElite"
    },
    "horario": {
      "segunda": "09:00 - 19:00",
      "terca": "09:00 - 19:00", 
      "quarta": "09:00 - 19:00",
      "quinta": "09:00 - 19:00",
      "sexta": "09:00 - 20:00",
      "sabado": "08:00 - 18:00",
      "domingo": "Fechado"
    }
  },
  "identidade_visual": {
    "cores": {
      "primaria": "#D4AF37",
      "secundaria": "#1A1A1A", 
      "destaque": "#B8860B",
      "texto": "#FFFFFF",
      "fundo": "#0A0A0A"
    },
    "logo": {
      "url": "/assets/logo-cliente.png",
      "alt": "Logo Barbearia Elite"
    },
    "estilo": "classico"
  },
  "sobre": {
    "historia": "Há mais de 35 anos, a Barbearia Elite é referência em cortes masculinos na região central de São Paulo. Combinamos tradição familiar com técnicas modernas.",
    "missao": "Proporcionar uma experiência única de cuidado masculino com excelência e tradição.",
    "valores": ["Tradição", "Qualidade", "Respeito", "Excelência"]
  },
  "servicos": [
    {
      "nome": "Corte Tradicional",
      "descricao": "Corte clássico masculino com navalha e acabamento perfeito",
      "preco": 35.00,
      "duracao": 45,
      "ativo": true
    },
    {
      "nome": "Barba Completa", 
      "descricao": "Aparação, modelagem e hidratação da barba",
      "preco": 25.00,
      "duracao": 30,
      "ativo": true
    },
    {
      "nome": "Combo Completo",
      "descricao": "Corte + Barba + Sobrancelha + Relaxamento",
      "preco": 55.00,
      "duracao": 75,
      "ativo": true
    }
  ],
  "barbeiros": [
    {
      "nome": "João Silva",
      "especialidade": "Cortes clássicos e barbas",
      "experiencia": "15 anos de experiência",
      "foto": "/assets/joao-silva.jpg",
      "ativo": true
    },
    {
      "nome": "Pedro Santos",
      "especialidade": "Cortes modernos e desenhos",
      "experiencia": "8 anos de experiência", 
      "foto": "/assets/pedro-santos.jpg",
      "ativo": true
    }
  ],
  "galeria": [
    "/assets/galeria/foto1.jpg",
    "/assets/galeria/foto2.jpg",
    "/assets/galeria/foto3.jpg"
  ],
  "depoimentos": [
    {
      "nome": "Carlos Oliveira",
      "texto": "Melhor barbearia da região! Atendimento nota 10 e sempre saio satisfeito.",
      "avaliacao": 5
    },
    {
      "nome": "Roberto Silva",
      "texto": "Tradição e qualidade em um só lugar. Recomendo para todos!",
      "avaliacao": 5
    }
  ]
}
```

## Scripts de Personalização Automática

### 1. Script de Atualização de Dados

Crie um arquivo `scripts/personalizar.js`:

```javascript
const fs = require('fs');
const path = require('path');

function personalizarSite(configPath) {
  // Carrega configuração do cliente
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Atualiza arquivo de configuração do site
  const siteConfig = {
    VITE_EMPRESA_NOME: config.empresa.nome,
    VITE_EMPRESA_SLOGAN: config.empresa.slogan,
    VITE_TELEFONE: config.empresa.contato.telefone,
    VITE_WHATSAPP: config.empresa.contato.whatsapp,
    VITE_EMAIL: config.empresa.contato.email,
    VITE_INSTAGRAM: config.empresa.contato.instagram,
    VITE_ENDERECO: `${config.empresa.endereco.rua}, ${config.empresa.endereco.bairro}`,
    VITE_CIDADE: config.empresa.endereco.cidade,
    VITE_MAPS_URL: config.empresa.endereco.maps_url
  };
  
  // Salva arquivo .env
  const envContent = Object.entries(siteConfig)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  fs.writeFileSync('.env', envContent);
  
  console.log('✅ Site personalizado com sucesso!');
  console.log(`📊 Cliente: ${config.empresa.nome}`);
  console.log(`🏪 Serviços cadastrados: ${config.servicos.length}`);
  console.log(`👨‍💼 Barbeiros cadastrados: ${config.barbeiros.length}`);
}

// Uso: node scripts/personalizar.js config-cliente.json
const configPath = process.argv[2];
if (configPath) {
  personalizarSite(configPath);
} else {
  console.log('❌ Uso: node scripts/personalizar.js <caminho-do-config>');
}
```

### 2. Template de Coleta de Dados

Crie um formulário HTML simples para coletar dados do cliente:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personalização - Dados da Barbearia</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .section h3 { color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
        input, textarea, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #D4AF37; color: white; padding: 15px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #B8860B; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    </style>
</head>
<body>
    <h1>🎨 Personalização da Barbearia</h1>
    <p>Preencha os dados abaixo para personalizar o site da sua barbearia:</p>

    <form id="configForm">
        <!-- Dados da Empresa -->
        <div class="section">
            <h3>📋 Dados da Empresa</h3>
            <input type="text" name="nome" placeholder="Nome da Barbearia" required>
            <input type="text" name="slogan" placeholder="Slogan/Frase de Efeito">
            <div class="grid">
                <input type="text" name="endereco" placeholder="Endereço Completo" required>
                <input type="text" name="cidade" placeholder="Cidade" required>
            </div>
            <div class="grid">
                <input type="tel" name="telefone" placeholder="Telefone" required>
                <input type="text" name="whatsapp" placeholder="WhatsApp (só números)">
            </div>
            <div class="grid">
                <input type="email" name="email" placeholder="E-mail">
                <input type="text" name="instagram" placeholder="Instagram (@usuario)">
            </div>
        </div>

        <!-- Horário de Funcionamento -->
        <div class="section">
            <h3>🕐 Horário de Funcionamento</h3>
            <div class="grid">
                <input type="text" name="seg_sex" placeholder="Segunda a Sexta (ex: 09:00 - 19:00)">
                <input type="text" name="sabado" placeholder="Sábado (ex: 08:00 - 18:00)">
            </div>
            <input type="text" name="domingo" placeholder="Domingo (ex: Fechado ou 10:00 - 16:00)">
        </div>

        <!-- Sobre a Barbearia -->
        <div class="section">
            <h3>📖 Sobre a Barbearia</h3>
            <textarea name="historia" rows="4" placeholder="Conte a história da barbearia, quando começou, tradição familiar, etc."></textarea>
            <textarea name="missao" rows="2" placeholder="Qual é a missão/propósito da barbearia?"></textarea>
        </div>

        <!-- Cores e Estilo -->
        <div class="section">
            <h3>🎨 Identidade Visual</h3>
            <div class="grid">
                <input type="color" name="cor_primaria" value="#D4AF37" title="Cor Principal (dourado)">
                <input type="color" name="cor_secundaria" value="#1A1A1A" title="Cor Secundária (preto)">
            </div>
            <select name="estilo">
                <option value="classico">Clássico/Tradicional</option>
                <option value="moderno">Moderno/Contemporâneo</option>
                <option value="vintage">Vintage/Retrô</option>
                <option value="minimalista">Minimalista/Clean</option>
            </select>
        </div>

        <button type="submit">💾 Gerar Configuração</button>
    </form>

    <script>
        document.getElementById('configForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const config = {
                empresa: {
                    nome: formData.get('nome'),
                    slogan: formData.get('slogan'),
                    endereco: {
                        completo: formData.get('endereco'),
                        cidade: formData.get('cidade')
                    },
                    contato: {
                        telefone: formData.get('telefone'),
                        whatsapp: formData.get('whatsapp'),
                        email: formData.get('email'),
                        instagram: formData.get('instagram')
                    },
                    horario: {
                        seg_sex: formData.get('seg_sex'),
                        sabado: formData.get('sabado'),
                        domingo: formData.get('domingo')
                    }
                },
                identidade_visual: {
                    cores: {
                        primaria: formData.get('cor_primaria'),
                        secundaria: formData.get('cor_secundaria')
                    },
                    estilo: formData.get('estilo')
                },
                sobre: {
                    historia: formData.get('historia'),
                    missao: formData.get('missao')
                }
            };
            
            // Baixa o arquivo de configuração
            const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `config-${config.empresa.nome.toLowerCase().replace(/\s+/g, '-')}.json`;
            a.click();
            
            alert('✅ Configuração gerada! Arquivo baixado com sucesso.');
        });
    </script>
</body>
</html>
```

## 💼 Processo de Entrega Profissional

### Checklist de Entrega

```markdown
## 📋 Checklist de Personalização

### Antes da Reunião
- [ ] Formulário de coleta preenchido
- [ ] Fotos do cliente coletadas (logo, equipe, trabalhos)
- [ ] Configuração JSON criada
- [ ] Ambiente de desenvolvimento preparado

### Durante a Personalização
- [ ] Dados da empresa atualizados
- [ ] Cores personalizadas aplicadas
- [ ] Logo inserida (se disponível)
- [ ] Serviços cadastrados no banco
- [ ] Barbeiros cadastrados no banco  
- [ ] Horários de funcionamento definidos
- [ ] Informações de contato atualizadas
- [ ] Texto "Sobre" personalizado

### Teste Final
- [ ] Site responsivo em mobile
- [ ] Todos os links funcionando
- [ ] Agendamento funcionando
- [ ] Admin panel acessível
- [ ] Informações corretas exibidas
- [ ] Performance otimizada

### Entrega ao Cliente
- [ ] Demonstração completa do site
- [ ] Treinamento do painel administrativo
- [ ] Manual de uso entregue
- [ ] Senhas e acessos configurados
- [ ] Suporte técnico ativado
```

### Manual de Uso para o Cliente

```markdown
# 📱 Manual de Uso - Painel Administrativo

## Como Acessar
1. Acesse: [seusite.com]/admin
2. Senha: [senha-personalizada]

## Principais Funções

### 📅 Gerenciar Agendamentos
- Ver todos os agendamentos do dia/semana
- Confirmar ou cancelar agendamentos
- Filtrar por barbeiro ou serviço

### 👨‍💼 Gerenciar Barbeiros
- Adicionar novos barbeiros
- Ativar/desativar barbeiros
- Definir especialidades

### ✂️ Gerenciar Serviços
- Adicionar novos serviços
- Alterar preços e durações
- Ativar/desativar serviços

### 📊 Relatórios
- Ver estatísticas de agendamentos
- Acompanhar faturamento mensal
- Identificar horários mais movimentados

## 🚨 Suporte Técnico
WhatsApp: [seu-whatsapp]
E-mail: [seu-email]
Horário: Segunda a Sexta, 9h às 18h
```

## 🎯 Dicas de Venda Durante a Personalização

### Upsells Naturais
1. **"Que tal uma logo profissional?"** - Quando cliente não tem logo
2. **"Posso integrar com seu Instagram?"** - Mostrar galeria de fotos
3. **"Quer que configure o Google Meu Negócio?"** - Para aparecer no Google Maps
4. **"Que tal um sistema de avaliações?"** - Para coletar depoimentos

### Demonstração de Valor
- Mostre como fica antes vs depois da personalização
- Simule agendamentos em tempo real
- Demonstre o painel administrativo
- Mostre estatísticas e relatórios

### Fechamento Técnico
- "Está aprovado assim?"
- "Posso já configurar para produção?"
- "Quando vocês querem começar a usar?"
- "Vou ativar o sistema agora, ok?"

---

## 📞 Próximos Passos

1. **Use o formulário HTML** para coletar dados dos clientes
2. **Crie um processo padronizado** de personalização
3. **Documente cada entrega** para usar como referência
4. **Colete depoimentos** dos primeiros clientes
5. **Refine o processo** baseado no feedback

**Lembre-se**: Cada cliente personalizado se torna uma referência para os próximos! 🚀