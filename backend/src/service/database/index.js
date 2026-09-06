const { Pool, types } = require('pg');
const Parameter = require('./parameter');

const { database } = require('../../config/var');

const dbConfig = {
  user: database.user,
  password: database.password,
  host: database.host,
  database: database.database,
  port: database.port,
  max: 80,
  ssl: false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 900000,
  statement_timeout: 30000,
  query_timeout: 30000,
};

const pool = new Pool(dbConfig);

types.setTypeParser(1700, (val) => parseFloat(val));

function convertNamedQueryToPositional(sqlStmt, params) {
  const values = [];
  const fields = [];
  let paramIndex = 1;

  const newQueryText = sqlStmt.replace(/\$\w+/g, (match) => {
    const paramName = match.substring(1);
    fields.push(paramName);
    values.push(params[paramName]);
    const result = `$${paramIndex}`;
    paramIndex += 1;
    return result;
  });

  return { sqlStmt: newQueryText, params: values };
}

function convertStringLiteralToQuery(strings, ...values) {
  return {
    sqlStmt: strings.reduce((query, str, i) => query + str + (i < values.length ? `$${i + 1}` : ''), ''),
    params: values,
  };
}

async function getConnection() {
  const client = await pool.connect();

  async function queryAll(sqlStmt, params) {
    const res = await client.query(sqlStmt, params);
    return res.rows;
  }

  async function queryOne(sqlStmt, params) {
    const res = await queryAll(sqlStmt, params);
    return res[0];
  }

  async function namedQueryAll(sqlStmt, params) {
    const newQuery = convertNamedQueryToPositional(sqlStmt, params);
    const res = await queryAll(newQuery.sqlStmt, newQuery.params);
    return res;
  }

  async function namedQueryOne(sqlStmt, params) {
    const res = await namedQueryAll(sqlStmt, params);
    return res[0];
  }

  async function queryLiteralAll(strings, ...values) {
    const newQuery = convertStringLiteralToQuery(strings, ...values);
    const res = await queryAll(newQuery.sqlStmt, newQuery.params);
    return res;
  }

  async function queryLiteralOne(strings, ...values) {
    const res = await queryLiteralAll(strings, ...values);
    return res[0];
  }

  const obj = {
    client,
    query: (sqlStmt, params) => client.query(sqlStmt, params),
    release: () => client.release(),
    namedQueryAll,
    namedQueryOne,
    queryAll,
    queryOne,
    queryRow: queryOne,
    queryLiteralAll,
    queryLiteralOne,
  };

  return obj;
}

module.exports = {
  getConnection,
  parameter: (...params) => new Parameter(params),
};
