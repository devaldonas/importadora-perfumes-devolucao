// Cliente PostgreSQL local com API compatível com Supabase
// (mantém a mesma interface para não quebrar o código existente)

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres123',
  database: process.env.PGDATABASE || 'devolucao',
});

console.log('📌 Configurando PostgreSQL Client...');
console.log('Host:', process.env.PGHOST || 'localhost');
console.log('Database:', process.env.PGDATABASE || 'devolucao');

// Teste de conexão
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida!');
    console.log('📅 Hora do servidor:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
  }
}

testConnection();

// =====================================================
// CLIENTE COMPATÍVEL COM A API DO SUPABASE
// =====================================================
function createQueryBuilder(tableName) {
  const state = {
    table: tableName,
    select: '*',
    where: [],
    values: [],
    orderBy: null,
    limit: null,
    isInsert: false,
    isUpdate: false,
    isDelete: false,
    insertData: null,
    updateData: null,
  };

  const builder = {
    select(fields = '*') {
      state.select = fields;
      return builder;
    },
    insert(data) {
      state.isInsert = true;
      state.insertData = Array.isArray(data) ? data : [data];
      return builder;
    },
    update(data) {
      state.isUpdate = true;
      state.updateData = data;
      return builder;
    },
    delete() {
      state.isDelete = true;
      return builder;
    },
    eq(column, value) {
      state.values.push(value);
      state.where.push(`"${column}" = $${state.values.length}`);
      return builder;
    },
    in(column, values) {
      const placeholders = values.map((_, i) => {
        state.values.push(values[i]);
        return `$${state.values.length}`;
      }).join(', ');
      state.where.push(`"${column}" IN (${placeholders})`);
      return builder;
    },
    order(column, { ascending = true } = {}) {
      state.orderBy = `"${column}" ${ascending ? 'ASC' : 'DESC'}`;
      return builder;
    },
    limit(n) {
      state.limit = n;
      return builder;
    },
    single() {
      state.singleRow = true;
      return builder;
    },

    // Executa a query
    async then(resolve, reject) {
      try {
        let query = '';
        let result;

        if (state.isInsert) {
          const rows = state.insertData;
          const columns = Object.keys(rows[0]);
          const colNames = columns.map(c => `"${c}"`).join(', ');
          const valuePlaceholders = [];
          const allValues = [];

          rows.forEach((row, rowIdx) => {
            const placeholders = columns.map((col, colIdx) => {
              allValues.push(row[col] ?? null);
              return `$${allValues.length}`;
            }).join(', ');
            valuePlaceholders.push(`(${placeholders})`);
          });

          query = `INSERT INTO "${state.table}" (${colNames}) VALUES ${valuePlaceholders.join(', ')} RETURNING *`;
          result = await pool.query(query, allValues);

        } else if (state.isUpdate) {
          const cols = Object.keys(state.updateData);
          const setClauses = cols.map((col, i) => {
            state.values.unshift(state.updateData[col]);
            return `"${col}" = $${i + 1}`;
          }).join(', ');

          query = `UPDATE "${state.table}" SET ${setClauses}`;
          if (state.where.length > 0) {
            query += ` WHERE ${state.where.join(' AND ')}`;
          }
          query += ' RETURNING *';
          result = await pool.query(query, state.values);

        } else if (state.isDelete) {
          query = `DELETE FROM "${state.table}"`;
          if (state.where.length > 0) {
            query += ` WHERE ${state.where.join(' AND ')}`;
          }
          query += ' RETURNING *';
          result = await pool.query(query, state.values);

        } else {
          query = `SELECT ${state.select} FROM "${state.table}"`;
          if (state.where.length > 0) {
            query += ` WHERE ${state.where.join(' AND ')}`;
          }
          if (state.orderBy) query += ` ORDER BY ${state.orderBy}`;
          if (state.limit) query += ` LIMIT ${state.limit}`;
          result = await pool.query(query, state.values);
        }

        let data = result.rows;
        if (state.singleRow && data.length === 1) {
          data = data[0];
        }

        resolve({ data, error: null, count: result.rowCount });

      } catch (err) {
        console.error('❌ Query error:', err.message);
        resolve({ data: null, error: { message: err.message } });
      }
    }
  };

  return builder;
}

// Cliente final compatível com API Supabase
const supabase = {
  from(tableName) {
    return createQueryBuilder(tableName);
  },

  // Auth simplificada (não usada localmente)
  auth: {
    async getUser() {
      return { data: { user: { id: 1, email: 'admin@juno.com.br' } }, error: null };
    },
    async signInAnonymously() {
      return { data: { user: { id: 1 } }, error: null };
    },
    async getSession() {
      return { data: { session: { user: { id: 1 } } }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  // Acesso direto ao pool (para queries raw)
  pool
};

// Helper para queries raw (mantido do código original)
function getSupabaseClient(token) {
  return supabase;
}

module.exports = { supabase, getSupabaseClient, pool };
