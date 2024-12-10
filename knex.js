const knex = require('knex')
const dbConnection = knex({
    client: 'mssql',
    connection: {
        user: 'user',
        password: 'password',
        server: 'D3743-06',
        database: 'Magasin',
        options: {
            encrypt: true,
            trustServerCertificate: true,
        } 
   },
   "useNullAsDefault": true
});

module.exports = dbConnection;