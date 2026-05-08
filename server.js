require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

app.use(cors({
  origin: function(origin, cb) { cb(null, true); },
  credentials: true,
}));

app.use('/api/pagamentos/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/produtos',   require('./routes/produtos'));
app.use('/api/pedidos',    require('./routes/pedidos'));
app.use('/api/pagamentos', require('./routes/pagamentos'));
app.use('/api/cupons',     require('./routes/cupons'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/uploads',        express.static('uploads'));

app.get('/api/status', function(req, res) {
  res.json({ status: 'ok', servico: 'Nivra API', hora: new Date().toISOString() });
});

app.use(function(req, res) { res.status(404).json({ erro: 'Rota não encontrada.' }); });
app.use(function(err, req, res, next) { res.status(500).json({ erro: err.message }); });

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('\n🚀 Nivra API → http://localhost:' + PORT + '/api/status\n');
});