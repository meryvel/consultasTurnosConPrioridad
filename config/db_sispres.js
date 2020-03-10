const sql = require('mssql');

require('dotenv').config({path: 'variables.env'});

//sql.connect(process.env.SISPRES_DB);

/*const conectarDB = async () => {
    try {        
        await sql.connect(process.env.SISPRES_DB); 
        console.log('conectado desde DB');
         

    } catch (error) {    
        console.log(error);
        process.exit(1);            
    }
}

module.exports = conectarDB;*/

// async/await style:
const pool1 = new sql.ConnectionPool(process.env.SISPRES_DB);
pool1.connect();
console.log('db conectada');

pool1.on('error', err => {
    // ... error handler
})

module.exports = pool1;
