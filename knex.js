const knex = require('knex')
const db = knex({
    client: 'mssql',
    connection: {
        user: 'user',
        password: 'password',
        server: 'D3744-20',
        database: 'Magasin',
        options: {
            encrypt: true,
            trustServerCertificate: true,
        } 
   },
   "useNullAsDefault": true
});

module.exports = db;