#  Sistema de Gestão e Controle de Devoluções - Importadora de Perfumes

> **Status do Projeto:** 🟢 Em desenvolvimento ativo (Backend e Banco de Dados 100% funcionais em ambiente local)

**Objetivo:** Automatizar e simplificar o processo de logística reversa e devolução de perfumes árabes, integrando analistas comerciais, setor financeiro, transportadoras e clientes.

---

## 🚀 Principais Funcionalidades Implementadas

- ✅ **Gestão de Ocorrências:** Importação de planilhas (Excel) com validação de dados, listagem dinâmica e painel de métricas.
- ✅ **Integração com a SEFAZ:** Consulta automatizada de NFDs (Nota Fiscal de Devolução) via Certificado Digital A1. O sistema baixa o XML oficial, extrai os dados (Emitente, Destinatário, Transportadora, Valores) e preenche o sistema automaticamente.
- ✅ **Acompanhamento de Coletas:** Registro e controle do status de coletas por transportadora.
- ✅ **Validação de NFD:** Módulo completo para consultar a SEFAZ (via chave de 44 dígitos), importar XML/PDF e armazenar o XML completo para auditoria.
- ✅ **Painel Financeiro:** Visão de descontos concedidos e controle de processos pendentes/concluídos.
- ✅ **Design Minimalista:** Interface limpa e moderna (Clean UI) com foco na usabilidade.

---

## 🛠 Stack Tecnológica

### **Frontend**
- **React** (Hooks, Componentes Funcionais)
- **CSS Modules / Global CSS** (Design System minimalista)
- **Comunicação com API** via `fetch` (Cliente HTTP customizado)

### **Backend**
- **Node.js** + **Express**
- **PostgreSQL** (Banco de dados relacional local via Docker)
- **@vexta-systems/node-mde** (Integração SEFAZ)
- **xml2js** (Parser de XML)
- **JWT / Bcrypt** (Autenticação e segurança)

### **Infraestrutura e Ferramentas**
- **Docker & Docker Compose** (Containerização do banco de dados)
- **Git & GitHub** (Versionamento)
- **Postman** (Testes de API)

---

## 📂 Estrutura do Projeto

```text
DEVOLUÇÃO/
├── Backend/
│   ├── src/
│   │   ├── config/         # Configuração do PostgreSQL e variáveis
│   │   ├── controllers/    # Regras de negócio (Ocorrências, NFD, SEFAZ)
│   │   ├── middlewares/    # Autenticação
│   │   ├── routes/         # Rotas da API (RESTful)
│   │   └── services/       # Integração com SEFAZ
│   ├── certs/              # Certificado Digital (A1)
│   └── .env                # Variáveis de ambiente
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # Ocorrências, Validação NFD, Coletas, Financeiro
│   │   ├── services/       # Cliente HTTP customizado
│   │   └── App.js
│   └── .env
│
└── README.md

⚙️ Como rodar o projeto localmente
1. Pré-requisitos
Node.js (v18+)

Docker e Docker Compose instalados

2. Subir o Banco de Dados (PostgreSQL)
bash
docker run --name postgres-devolucao -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_USER=postgres -e POSTGRES_DB=devolucao -p 5432:5432 -d postgres:15
3. Configurar o Backend
bash
cd Backend
npm install
# Crie o arquivo .env com base nas variáveis necessárias (veja abaixo)
npm run dev
Variáveis essenciais no Backend/.env:

env
PORT=3000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres123
PGDATABASE=devolucao
CERTIFICADO_PATH=./certs/seu-certificado.pfx
CERTIFICADO_SENHA=sua_senha
CNPJ_EMPRESA=00000000000000
UF_CODIGO=35
AMBIENTE_SEFAZ=1 # 1 = Produção, 2 = Homologação
4. Configurar o Frontend
bash
cd Frontend
npm install
npm start

📌 Próximos Passos (Roadmap)
□ Automação de Coletas: Conectar diretamente com as APIs da Braspress, Daytona e Correios.
□ Notificações: Implementar alertas por e-mail (Nodemailer) para prazos de NFD e Coletas.
□ Gestão de Usuários: Implementar login real (JWT) com controle de permissões (Analista vs. Financeiro).
□ Deploy em Nuvem: Subir o Backend (Render/Railway) e Frontend (Vercel).

Autor
Devaldo Gonçalves do Nascimento

LinkedIn: linkedin.com/in/devaldo-nascimento-263b81105

GitHub: github.com/devaldonas

E-mail: devaldo.nas@gmail.com

Este projeto foi desenvolvido para resolver um problema real de logística reversa, unindo minha experiência em processos industriais com tecnologia moderna.
