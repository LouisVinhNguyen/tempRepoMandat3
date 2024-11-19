const knex = require('knex')
const dbConnection = knex({
    client: 'mssql',
    connection: {
        user: 'khinchan',
        password: 'Password1',
        server: 'D3742-25',
        database: 'Magasin',
        options: {
            encrypt: true,
            trustServerCertificate: true,
        } 
   },
   "useNullAsDefault": true
});

module.exports = dbConnection

// module.exports = {
            
//               user: 'enloja',
//               password: 'betchinie',
//               server: 'PROF-LJENCARAN1\\MSSQLSERVER01',
//              database: 'school',
//              options: {
//                  encrypt: true,
//                  trustServerCertificate: true,
//           } 
// };