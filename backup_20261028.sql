--
-- PostgreSQL database dump
--

\restrict u3s88XciVVghbYNenJkIsC6gN48OubJzUPid7bidFjXZJmGJfeJQCiDQhOAhppZ

-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 15.19 (Debian 15.19-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: coletas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coletas (
    id integer NOT NULL,
    ocorrencia_id integer,
    transportadora character varying(100),
    protocolo character varying(200),
    status character varying(50) DEFAULT 'Pendente'::character varying,
    data_coleta date,
    observacoes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.coletas OWNER TO postgres;

--
-- Name: coletas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coletas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coletas_id_seq OWNER TO postgres;

--
-- Name: coletas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coletas_id_seq OWNED BY public.coletas.id;


--
-- Name: nfd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nfd (
    id integer NOT NULL,
    ocorrencia_id integer,
    numero_nfd character varying(50),
    emitente_razao_social character varying(255),
    emitente_ie character varying(50),
    emitente_cnpj character varying(20),
    emitente_endereco text,
    emitente_data_emissao date,
    destinatario_razao_social character varying(255),
    destinatario_ie character varying(50),
    destinatario_cnpj character varying(20),
    destinatario_endereco text,
    transportadora_razao_social character varying(255),
    transportadora_ie character varying(50),
    transportadora_cnpj character varying(20),
    transportadora_endereco text,
    frete_conta character varying(20),
    quantidade_volume integer DEFAULT 0,
    peso_bruto numeric(10,2) DEFAULT 0,
    valor numeric(12,2) DEFAULT 0,
    responsavel_devolucao character varying(255),
    telefone_responsavel character varying(20),
    observacoes text,
    status character varying(50) DEFAULT 'Validada'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.nfd OWNER TO postgres;

--
-- Name: nfd_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nfd_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nfd_id_seq OWNER TO postgres;

--
-- Name: nfd_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nfd_id_seq OWNED BY public.nfd.id;


--
-- Name: ocorrencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ocorrencias (
    id integer NOT NULL,
    data date DEFAULT CURRENT_DATE,
    status character varying(50) DEFAULT 'Pendente'::character varying,
    cliente character varying(255),
    codigo_cliente character varying(50),
    nota_fiscal character varying(50),
    nota_devolucao character varying(50),
    produto character varying(255),
    quantidade integer DEFAULT 1,
    tipo_ocorrencia character varying(100),
    observacoes text,
    decisao character varying(50),
    protocolo_envio character varying(100),
    finalizado boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ocorrencias OWNER TO postgres;

--
-- Name: ocorrencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ocorrencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ocorrencias_id_seq OWNER TO postgres;

--
-- Name: ocorrencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ocorrencias_id_seq OWNED BY public.ocorrencias.id;


--
-- Name: sefaz_documentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sefaz_documentos (
    id integer NOT NULL,
    chave_acesso character varying(44),
    tipo character varying(10) DEFAULT 'NFD'::character varying,
    numero character varying(20),
    serie character varying(5),
    data_emissao date,
    valor_total numeric(12,2),
    emitente_cnpj character varying(20),
    emitente_ie character varying(20),
    emitente_razao_social character varying(255),
    emitente_endereco text,
    destinatario_cnpj character varying(20),
    destinatario_ie character varying(20),
    destinatario_razao_social character varying(255),
    destinatario_endereco text,
    transportadora_cnpj character varying(20),
    transportadora_razao_social character varying(255),
    transportadora_ie character varying(20),
    transportadora_endereco text,
    frete_por_conta character varying(20),
    peso_bruto numeric(10,2),
    quantidade_volume integer,
    xml_completo text,
    status character varying(20) DEFAULT 'pendente'::character varying,
    ultima_consulta timestamp without time zone,
    ocorrencia_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sefaz_documentos OWNER TO postgres;

--
-- Name: sefaz_documentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sefaz_documentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sefaz_documentos_id_seq OWNER TO postgres;

--
-- Name: sefaz_documentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sefaz_documentos_id_seq OWNED BY public.sefaz_documentos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    nome character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: coletas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coletas ALTER COLUMN id SET DEFAULT nextval('public.coletas_id_seq'::regclass);


--
-- Name: nfd id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfd ALTER COLUMN id SET DEFAULT nextval('public.nfd_id_seq'::regclass);


--
-- Name: ocorrencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocorrencias ALTER COLUMN id SET DEFAULT nextval('public.ocorrencias_id_seq'::regclass);


--
-- Name: sefaz_documentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sefaz_documentos ALTER COLUMN id SET DEFAULT nextval('public.sefaz_documentos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: coletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coletas (id, ocorrencia_id, transportadora, protocolo, status, data_coleta, observacoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nfd; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nfd (id, ocorrencia_id, numero_nfd, emitente_razao_social, emitente_ie, emitente_cnpj, emitente_endereco, emitente_data_emissao, destinatario_razao_social, destinatario_ie, destinatario_cnpj, destinatario_endereco, transportadora_razao_social, transportadora_ie, transportadora_cnpj, transportadora_endereco, frete_conta, quantidade_volume, peso_bruto, valor, responsavel_devolucao, telefone_responsavel, observacoes, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ocorrencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ocorrencias (id, data, status, cliente, codigo_cliente, nota_fiscal, nota_devolucao, produto, quantidade, tipo_ocorrencia, observacoes, decisao, protocolo_envio, finalizado, created_at, updated_at) FROM stdin;
2	2026-10-28	Aguardando NFD	NETZACH COM. VAR. DE PERF. E CONV. EIRELI	303976	4842	\N	WARD AL GHARAM EDP 100ML	2	AVARIA	PRODUTO QUEBRADO / vazando	Reposição	\N	f	2026-10-28 20:48:28.225909	2026-10-28 20:54:09.364619
1	2026-10-28	Aguardando NFD	CLIENTE TESTE LTDA	\N	12345	\N	PERFUME TESTE 100ML	2	Avaria	\N	Desconto	\N	f	2026-10-28 20:26:51.282224	2026-10-28 20:54:21.423604
\.


--
-- Data for Name: sefaz_documentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sefaz_documentos (id, chave_acesso, tipo, numero, serie, data_emissao, valor_total, emitente_cnpj, emitente_ie, emitente_razao_social, emitente_endereco, destinatario_cnpj, destinatario_ie, destinatario_razao_social, destinatario_endereco, transportadora_cnpj, transportadora_razao_social, transportadora_ie, transportadora_endereco, frete_por_conta, peso_bruto, quantidade_volume, xml_completo, status, ultima_consulta, ocorrencia_id, created_at, updated_at) FROM stdin;
1	35260204182553000163550010000001001294520252	NFD	100	\N	\N	154.80	\N	\N	EMPRESA TESTE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	validado	\N	\N	2026-10-28 20:26:51.293342	2026-10-28 20:26:51.293342
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, senha_hash, nome, role, created_at) FROM stdin;
1	admin@juno.com.br	admin123	Admin	admin	2026-10-28 20:26:51.271185
\.


--
-- Name: coletas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coletas_id_seq', 1, false);


--
-- Name: nfd_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nfd_id_seq', 1, false);


--
-- Name: ocorrencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ocorrencias_id_seq', 2, true);


--
-- Name: sefaz_documentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sefaz_documentos_id_seq', 1, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);


--
-- Name: coletas coletas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coletas
    ADD CONSTRAINT coletas_pkey PRIMARY KEY (id);


--
-- Name: nfd nfd_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfd
    ADD CONSTRAINT nfd_pkey PRIMARY KEY (id);


--
-- Name: ocorrencias ocorrencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocorrencias
    ADD CONSTRAINT ocorrencias_pkey PRIMARY KEY (id);


--
-- Name: sefaz_documentos sefaz_documentos_chave_acesso_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sefaz_documentos
    ADD CONSTRAINT sefaz_documentos_chave_acesso_key UNIQUE (chave_acesso);


--
-- Name: sefaz_documentos sefaz_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sefaz_documentos
    ADD CONSTRAINT sefaz_documentos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_coletas_ocorrencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coletas_ocorrencia ON public.coletas USING btree (ocorrencia_id);


--
-- Name: idx_nfd_ocorrencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nfd_ocorrencia ON public.nfd USING btree (ocorrencia_id);


--
-- Name: idx_ocorrencias_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ocorrencias_cliente ON public.ocorrencias USING btree (cliente);


--
-- Name: idx_ocorrencias_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ocorrencias_status ON public.ocorrencias USING btree (status);


--
-- Name: idx_sefaz_chave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sefaz_chave ON public.sefaz_documentos USING btree (chave_acesso);


--
-- Name: coletas coletas_ocorrencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coletas
    ADD CONSTRAINT coletas_ocorrencia_id_fkey FOREIGN KEY (ocorrencia_id) REFERENCES public.ocorrencias(id) ON DELETE CASCADE;


--
-- Name: nfd nfd_ocorrencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfd
    ADD CONSTRAINT nfd_ocorrencia_id_fkey FOREIGN KEY (ocorrencia_id) REFERENCES public.ocorrencias(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict u3s88XciVVghbYNenJkIsC6gN48OubJzUPid7bidFjXZJmGJfeJQCiDQhOAhppZ

