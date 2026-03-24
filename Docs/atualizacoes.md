# Atualizações do Sistema de Gestão e Controle de Devolução de Produtos

## 📅 24 de Março de 2026

### 🔧 Mudanças na Estrutura do Banco de Dados

#### Campo `frete` na Tabela `nfd`
- **Descrição:** O campo `frete` foi alterado para receber apenas os valores "CIF" ou "FOB".
- **Motivo:** Padronizar e garantir a consistência dos dados relacionados ao tipo de frete.
- **Alterações Realizadas:**
  1. Adicionada uma coluna temporária `frete_temp`.
  2. Convertidos os valores antigos para "CIF".
  3. Removida a coluna antiga `frete`.
  4. Renomeada a coluna temporária para `frete`.
  5. Definida a coluna `frete` como `NOT NULL`.
  6. Adicionada uma constraint `CHECK` para validar os valores ("CIF" ou "FOB").

#### Scripts SQL Utilizados:
```sql
-- 1. Verificar dados existentes
SELECT id, frete FROM nfd;

-- 2. Adicionar uma coluna temporária
ALTER TABLE nfd ADD COLUMN frete_temp VARCHAR(10);

-- 3. Converter valores antigos para novos
UPDATE nfd SET frete_temp = 'CIF' WHERE frete IS NOT NULL;

-- 4. Remover a coluna antiga
ALTER TABLE nfd DROP COLUMN frete;

-- 5. Renomear a coluna temporária
ALTER TABLE nfd RENAME COLUMN frete_temp TO frete;

-- 6. Tornar a coluna NOT NULL
ALTER TABLE nfd ALTER COLUMN frete SET NOT NULL;

-- 7. Adicionar a constraint CHECK
ALTER TABLE nfd ADD CONSTRAINT frete_check CHECK (frete IN ('CIF', 'FOB'));

-- 8. Verificar o resultado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nfd' AND column_name = 'frete';

-- 9. Verificar os dados convertidos
SELECT id, frete FROM nfd;
