const sqlite3 = require('sqlite3').verbose();
import { logger } from './helper/default.logger';

const db = new sqlite3.Database('./NodeAPI.db', err => {
  if (err) {
    logger.info(`Erro ao conectar ao SQLite:`, err.message);
  } else {
    logger.info(`Conexão SQLite estabelecida com sucesso! database local: NodeAPI`);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS NumberID (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER,
      num_perfil_whatsapp INTEGER,
      data_inclusao TEXT
    )
  `);
});

function addNovoNumero(numero, numeroOld, data_inclusao) {
  const sql = 'INSERT INTO NumberID (numero, num_perfil_whatsapp, data_inclusao) VALUES (?, ?, ?)';

  db.run(sql, [numero, numeroOld, data_inclusao], function(err) {
    if (err) {
        logger.info(`Erro ao cadastrar dados:`, err.message);
    } else {
      //logger.info(`Dados cadastrados com sucesso! ID:`, this.lastID);
    }
  });
}

function consultarTodosNumeros() {
  const sql = 'SELECT * FROM NumberID';

  db.all(sql, [], (err, rows) => {
    if (err) {
        logger.info(`Erro ao consultar dados:`, err.message);
    } else {
      rows.forEach(row => {
        console.log(row);
      });
    }
  });
}

async function consultarPorNumero(numero: string): Promise<string> {
    //const sql = 'SELECT * FROM NumberID WHERE numero = ? OR num_perfil_whatsapp = ?';
    const sql = 'select * from NumberID where numero = ?';
    try {
      const rows: Array<any> = await new Promise((resolve, reject) => {
        db.all(sql, [numero], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
  
      if (rows.length > 0) {
        const resultado = rows.map(row => {
          return {
            ID: row.ID,
            numero: row.numero,
            num_perfil_whatsapp: row.num_perfil_whatsapp
          };
        });
        //console.log(JSON.stringify(resultado, null, 2));
        return JSON.stringify(resultado);
      } else {
        //logger.info(`Nenhum registro encontrado com o número informado.`);
        return "";
      }
    } catch (err) {
        logger.info(`Erro ao consultar o número: ${numero}`, err.message);
      return "";
    }
  }
  
function excluirTodosNumeros() {
    const sql = 'DELETE FROM NumberID';
  
    db.run(sql, function (err) {
      if (err) {
        logger.info(`Erro ao excluir dados.`, err.message);
      } else {
        logger.info(`Todos os dados excluídos com sucesso do banco local.`);
      }
    });
  }

function atualizarNumero(id, numero, numeroOld) {
  const sql = 'UPDATE NumberID SET numero = ?, num_perfil_whatsapp = ? WHERE ID = ?';

  db.run(sql, [numero, numeroOld, id], function(err) {
    if (err) {
        logger.info(`Erro ao atualizar dados:`, err.message);
    } else {
      if (this.changes > 0) {
        logger.info(`Dados atualizados com sucesso!`);
      } else {
        logger.info(`Registro não encontrado.`);
      }
    }
  });
}

module.exports = {
  addNovoNumero,
  consultarTodosNumeros,
  atualizarNumero,
  consultarPorNumero,
  excluirTodosNumeros
};
