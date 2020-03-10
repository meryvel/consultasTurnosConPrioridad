//importar express
const express = require('express');
const conectarDB = require('./config/db_sispres');

//crear el servidor express
const app = express();

//Habilitar express.json
app.use(express.json({extended: true}));
 
//puerto de la app
const PORT = process.env.PORT || 4000

//Importar rutas 
app.use('/api/afiliados', require('./routes/afiliados'));

app.listen(PORT, () => {
    console.log(`El servidor esta funcionando y escuchando por el puerto ${PORT}`);
    
});


 
//let dni = 28647279;
//const result = await conectarDB.query `select * from vPadronPlanes where id = ${dni}`
