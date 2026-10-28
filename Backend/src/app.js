require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const nfdRoutes = require('./routes/nfdRoutes');
const ocorrenciaRoutes = require('./routes/ocorrenciaRoutes');
const sefazRoutes = require('./routes/sefazRoutes');
const coletaRoutes = require('./routes/coletaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/nfd', nfdRoutes);
app.use('/ocorrencias', ocorrenciaRoutes);
app.use('/sefaz', sefazRoutes);
app.use('/coletas', coletaRoutes);

app.get('/', (req, res) => {
  res.send('Backend do Sistema de Devolução');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
