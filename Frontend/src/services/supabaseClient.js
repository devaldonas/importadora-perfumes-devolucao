// Cliente fake compatível com API Supabase
// Faz chamadas HTTP para o backend local

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

console.log('🌐 API Backend:', API_URL);

function createQueryBuilder(tableName) {
  const state = {
    table: tableName,
    filters: {},
    isInsert: false,
    insertData: null,
    isUpdate: false,
    updateData: null,
    isDelete: false,
    singleRow: false,
    orderBy: null,
    selectFields: '*',
  };

  const builder = {
    select(fields = '*') { state.selectFields = fields; return builder; },
    insert(data) { state.isInsert = true; state.insertData = Array.isArray(data) ? data : [data]; return builder; },
    update(data) { state.isUpdate = true; state.updateData = data; return builder; },
    delete() { state.isDelete = true; return builder; },
    eq(column, value) { state.filters[column] = value; return builder; },
    in(column, values) { state.filters[`${column}__in`] = values.join(','); return builder; },
    order(column, { ascending = true } = {}) { state.orderBy = { column, ascending }; return builder; },
    single() { state.singleRow = true; return builder; },

    async then(resolve, reject) {
      try {
        let url = `${API_URL}/${state.table}`;
        let method = 'GET';
        let body = null;

        const params = new URLSearchParams();
        Object.entries(state.filters).forEach(([k, v]) => {
          if (k.endsWith('__in')) {
            params.append(k.replace('__in', ''), v);
          } else {
            params.append(k, v);
          }
        });
        if (params.toString()) url += `?${params.toString()}`;

        if (state.isInsert) {
          method = 'POST';
          body = JSON.stringify(state.insertData[0]);
        } else if (state.isUpdate && state.filters.id) {
          url = `${API_URL}/${state.table}/${state.filters.id}`;
          method = 'PUT';
          body = JSON.stringify(state.updateData);
        } else if (state.isDelete && state.filters.id) {
          url = `${API_URL}/${state.table}/${state.filters.id}`;
          method = 'DELETE';
        } else if (state.filters.id && !state.isUpdate) {
          url = `${API_URL}/${state.table}/${state.filters.id}`;
        }

        console.log(`[${method}] ${url}`);

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        const result = await response.json();

        if (!response.ok) {
          resolve({ data: null, error: { message: result.error || 'Erro desconhecido' } });
          return;
        }

        let data = result;
        if (state.singleRow && Array.isArray(data)) {
          data = data[0];
        }

        resolve({ data, error: null });

      } catch (err) {
        console.error('❌ Query error:', err.message);
        resolve({ data: null, error: { message: err.message } });
      }
    }
  };

  return builder;
}

const supabase = {
  from(tableName) {
    return createQueryBuilder(tableName);
  },
  auth: {
    async getUser() { return { data: { user: { id: 1, email: 'admin@juno.com.br' } }, error: null }; },
    async signInAnonymously() { return { data: { user: { id: 1 } }, error: null }; },
    async getSession() { return { data: { session: { user: { id: 1 } } }, error: null }; },
    onAuthStateChange() { return { data: { subscription: { unsubscribe: () => {} } } }; }
  }
};

fetch(`${API_URL}/`)
  .then(r => r.text())
  .then(txt => console.log('✅ Backend conectado:', txt))
  .catch(err => console.error('❌ Erro ao conectar backend:', err.message));

export default supabase;
