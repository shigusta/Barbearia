#!/bin/bash

# Script de backup do sistema de barbearia
# Cria backup completo do código e banco de dados

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
PROJECT_NAME="barbershop-system"

echo "🔄 Iniciando backup do sistema..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do código fonte
echo "📁 Fazendo backup do código fonte..."
tar -czf "$BACKUP_DIR/${PROJECT_NAME}_code_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=backups \
  client/ server/ shared/ docs/ scripts/ assets/ *.json *.ts *.js *.md

# Backup do banco de dados (se DATABASE_URL estiver configurada)
if [ ! -z "$DATABASE_URL" ]; then
  echo "🗄️  Fazendo backup do banco de dados..."
  pg_dump $DATABASE_URL > "$BACKUP_DIR/${PROJECT_NAME}_db_$DATE.sql"
fi

echo "✅ Backup concluído!"
echo "📦 Arquivos salvos em: $BACKUP_DIR/"
ls -la $BACKUP_DIR/