#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para personalizar o site da barbearia com dados do cliente
 * Uso: node scripts/personalizar.js config-cliente.json
 */

function personalizarSite(configPath) {
  try {
    // Carrega configuração do cliente
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Cria arquivo de configuração do site
    const siteConfig = {
      VITE_EMPRESA_NOME: config.empresa.nome,
      VITE_EMPRESA_SLOGAN: config.empresa.slogan || '',
      VITE_TELEFONE: config.empresa.contato.telefone || '',
      VITE_WHATSAPP: config.empresa.contato.whatsapp || '',
      VITE_EMAIL: config.empresa.contato.email || '',
      VITE_INSTAGRAM: config.empresa.contato.instagram || '',
      VITE_ENDERECO: config.empresa.endereco ? 
        `${config.empresa.endereco.rua}, ${config.empresa.endereco.bairro}` : '',
      VITE_CIDADE: config.empresa.endereco?.cidade || '',
      VITE_MAPS_URL: config.empresa.endereco?.maps_url || ''
    };
    
    // Salva arquivo .env
    const envContent = Object.entries(siteConfig)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Site personalizado com sucesso!');
    console.log(`📊 Cliente: ${config.empresa.nome}`);
    console.log(`🏪 Serviços cadastrados: ${config.servicos?.length || 0}`);
    console.log(`👨‍💼 Barbeiros cadastrados: ${config.barbeiros?.length || 0}`);
    
    // Gera SQL para inserir dados no banco
    if (config.servicos && config.servicos.length > 0) {
      const servicosSQL = config.servicos.map(servico => 
        `INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo) VALUES ('${servico.nome}', '${servico.descricao}', ${servico.preco}, ${servico.duracao}, true);`
      ).join('\n');
      
      fs.writeFileSync('temp_servicos.sql', servicosSQL);
      console.log('📄 Arquivo temp_servicos.sql gerado para inserção no banco');
    }
    
    if (config.barbeiros && config.barbeiros.length > 0) {
      const barbeirosSQL = config.barbeiros.map(barbeiro => 
        `INSERT INTO barbeiros (nome, ativo) VALUES ('${barbeiro.nome}', true);`
      ).join('\n');
      
      fs.writeFileSync('temp_barbeiros.sql', barbeirosSQL);
      console.log('📄 Arquivo temp_barbeiros.sql gerado para inserção no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro ao personalizar site:', error.message);
    process.exit(1);
  }
}

// Uso do script
const configPath = process.argv[2];
if (!configPath) {
  console.log('❌ Uso: node scripts/personalizar.js <caminho-do-config>');
  console.log('📝 Exemplo: node scripts/personalizar.js config-barbearia-elite.json');
  process.exit(1);
}

if (!fs.existsSync(configPath)) {
  console.error(`❌ Arquivo não encontrado: ${configPath}`);
  process.exit(1);
}

personalizarSite(configPath);