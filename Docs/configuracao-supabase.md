# Configuração do Supabase

## 1. Criar Projeto
1. Acessar [Supabase](https://supabase.com/) e criar um novo projeto.

## 2. Configurar Tabelas
Comandos SQL no Supabase para criar as tabelas iniciais:

```sql
CREATE TABLE ocorrencias (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  cliente VARCHAR(100) NOT NULL,
  produto VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  descricao TEXT
);

CREATE TABLE nfd (
  id SERIAL PRIMARY KEY,
  remetente VARCHAR(100) NOT NULL,
  destinatario VARCHAR(100) NOT NULL,
  transportadora VARCHAR(100) NOT NULL,
  frete DECIMAL(10, 2) NOT NULL,
  volume INTEGER NOT NULL,
  peso DECIMAL(10, 2) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL
);
