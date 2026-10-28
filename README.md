# 🧴 Sistema de Gestão e Controle de Devoluções - Importadora de Perfumes

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
