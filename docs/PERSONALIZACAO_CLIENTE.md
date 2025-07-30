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
  }
}
```

## Checklist de Personalização

### ✅ Dados da Empresa
- [ ] Nome da barbearia no header
- [ ] Logo personalizada
- [ ] Cores da marca
- [ ] Informações de contato
- [ ] Endereço e mapa
- [ ] Horário de funcionamento
- [ ] Links das redes sociais

### ✅ Conteúdo
- [ ] Texto "Sobre Nós" personalizado
- [ ] Missão, visão e valores
- [ ] História da barbearia
- [ ] Depoimentos de clientes reais
- [ ] Galeria de fotos dos trabalhos

### ✅ Serviços
- [ ] Lista completa de serviços
- [ ] Preços atualizados
- [ ] Descrições detalhadas
- [ ] Duração de cada serviço
- [ ] Fotos dos serviços

### ✅ Equipe
- [ ] Cadastro de todos os barbeiros
- [ ] Fotos profissionais
- [ ] Especialidades de cada um
- [ ] Biografias curtas

# 🏗️ Passo a Passo: Da Personalização à Entrega para o Cliente

## Fase 1: Preparação da Infraestrutura - Cada cliente terá seu próprio ambiente isolado.

1. Crie um Novo Repositório no GitHub (Opcional, mas Recomendado)
Para manter o código de cada cliente organizado, crie um novo repositório privado no GitHub (ex: barbearia-cliente-novo). Copie todos os arquivos do seu projeto BarberBooking para dentro dele.

2. Crie um Novo Banco de Dados na Neon
Esta é a etapa mais crítica para manter os dados do cliente seguros e separados.

Acesse sua conta na Neon.

Crie um novo projeto (ex: cliente-novo-db).

A Neon irá gerar uma nova DATABASE_URL (URL de Conexão) exclusiva para este cliente. Copie e guarde esta URL.

## Fase 2: Configuração e Personalização - Agora vamos usar os dados do cliente para moldar o sistema.

3. Colete os Dados do Cliente
Use a lista que você mesmo criou na sua documentação como um checklist.

Informações da Barbearia: Nome, endereço, telefone, WhatsApp, redes sociais, etc..

Identidade Visual: Peça o logo e as fotos que ele quer usar no site.

Serviços: Uma lista com nome, descrição, preço e duração de cada serviço.

Barbeiros: O nome de cada barbeiro.

Horários de Funcionamento: Qual o horário de abertura e fechamento para cada dia da semana.

**Obs.:** Utilizar o script para rodar o json para melhor customização.

4. Personalize o Código e o Banco de Dados
Código Frontend: No seu código local (no VS Code), altere os textos fixos (como endereço no rodapé) e troque as imagens e o logo para os do seu cliente.

Banco de Dados: Esta é a parte mais importante. Você precisa popular o banco de dados novo do cliente com as informações dele. A forma mais fácil é alterar temporariamente sua função seedInitialData no arquivo server/index.ts:

Substitua os nomes dos barbeiros e serviços padrão pelos do seu cliente.

Ajuste os horários de funcionamento no seed para corresponder aos do cliente.

Conecte-se ao banco do cliente (alterando a DATABASE_URL no seu .env para a do cliente).

Execute o seed uma vez com npm run dev para popular o banco.

## Fase 3: Deploy e Entrega - Agora vamos colocar a versão personalizada do cliente no ar.

5. Faça o Deploy do Backend (Ex: na Render)
Crie uma conta na Render (ou outro serviço de sua preferência).

Crie um "New Web Service" e conecte-o ao repositório do cliente no GitHub.

Nas "Environment Variables" do projeto na Render, cole a DATABASE_URL e a JWT_SECRET do cliente.

A Render fará o deploy e te dará uma URL para o backend (ex: cliente-novo.onrender.com).

6. Faça o Deploy do Frontend (Ex: na Vercel)
Crie uma conta na Vercel.