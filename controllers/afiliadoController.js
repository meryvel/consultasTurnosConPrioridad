const cn = require('../config/db_sispres');

exports.obtenerAfiliado = async (req, res) =>{
      
    try {
        const request = cn.request();
        let dni = 28647279;
        const result = await request.query(`SELECT * FROM vConsultaAfiliado WHERE nroi = ${dni}`);
        //console.log(result);        
        res.json(result.recordsets);

    } catch (error) {
        console.log(error);        
    }                
}

exports.obtenerPrioridadAfi = async (req, res) => {

    try {
        const request = cn.request();
        let dni = 12712677;
        let hoy = new Date();
        const formatted_date = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate();
            
       // ----------------------------- PRIORIDAD POR PLANES 1 - 8 - 9 ----------------------------------------------//
        let sql = `SELECT * FROM vPadronPlanes WHERE nroi = ${dni} AND EstadoAfiliado = 1 AND '${formatted_date}' BETWEEN VigenciaDesde AND VigenciaHasta`;
        let result = await request.query(sql);
        //console.log(result); 
        const planesPrioridad = [1, 8, 9];
        //res.json(result.recordset[0]);
        result = result.recordset;

        let prioridad = null;
        for (let i = 0; i < result.length; i++) {
            if (planesPrioridad.includes(result[i].CODIGO_PLAN)){
                //console.log('ingresa al if includes', result[i].CODIGO_PLAN);
                switch (result[i].CODIGO_PLAN){
                    case 1:
                        prioridad = {
                            nombre: result[i].APELLIDOYNOMBRE,
                            dni: result[i].nroi,
                            motivo: "PLAN MATERNO INFANTIL"
                        }
                        break;
                    case 8:
                        prioridad = {
                            nombre: result[i].APELLIDOYNOMBRE,
                            dni: result[i].nroi,
                            motivo: "PACIENTE ONCOLOGICO"
                        }
                        break;
                    case 9:
                        prioridad = {
                            nombre: result[i].APELLIDOYNOMBRE,
                            dni: result[i].nroi,
                            motivo: "AFILIADOS EN DIALISIS"
                        }
                        break;
                }
                if(prioridad !== null){
                    break;
                }                
            }           
        }
        console.log('prioridad planes:');        
        console.log(prioridad);
         
        // ----------------------------- PRIORIDAD POR PADRON TRANSPLANTE -----------------------------------------//
        sql = `SELECT * FROM vPadronTrasplante WHERE nroi = ${dni} and ESTADO_PADRON_TRASPLANTE = 'ACTIVO'`;
        result = await request.query(sql);
            
        
        if (result.recordset.length !== 0) {
            result = result.recordset[0];
            console.log('resultado trasplante:');
            console.log(result);

            prioridad = {
                nombre: result.anrz,
                dni: result.nroi,
                motivo: "AFILIADO EN PADRÓN DE TRASPLANTE"
            }            
        }          
        console.log('prioridad trasplante:');
        console.log(prioridad); 
         
        // --------------------------- AFILIADOS JUBILADOS O MAYORES A 57 años --------------------------------------// 
        sql = `SELECT * FROM vConsultaAfiliado WHERE nroi = ${dni}`;
        result = await request.query(sql);       
        
        if (result.recordset.length === 0) {
            res.status(404).send({
                msg: 'No existe afiliado'
            });
            return;
        }
        result = result.recordset[0];
        console.log('result AFILIADO:');
        console.log(result);


        if(result.esta === false){
            res.status(404).send({
                msg: 'Afialido Inactivo'
            });    
            return;       
        }       
               
        const gruposJubilados = [1, 2, 3, 4, 5, 6];
        if (gruposJubilados.includes(result.cgpo)) {
            if(result.edad >= 57){
                prioridad = {
                    nombre: result.anrz,
                    dni: result.nroi,
                    motivo: "JUBILADO"
                }
            }
        }
        console.log('prioridad jubilado:');
        console.log(prioridad);

        // ------------------------------- AFILIADOS DISCAPACITADOS -------------------------------------------//
        if (result.cinc === true && result.esds === "P"){
            prioridad = {
                nombre: result.anrz,
                dni: result.nroi,
                motivo: "PRIORIDAD POR DISCAPACIDAD P"
            }
        }
        console.log('prioridad por discapacidad permanente:');
        console.log(prioridad);

       if (result.cinc === true && result.esds === "T") {
            let fechaDesde = result.fcds;
            let fechaHasta = result.fvcd;
            if(hoy >= fechaDesde && hoy <=fechaHasta){
                prioridad = {
                    nombre: result.anrz,
                    dni: result.nroi,
                    motivo: "PRIORIDAD POR DISCAPACIDAD"
                }
             }            
        }
        console.log('prioridad por discapacidad temporaria:');
        console.log(prioridad); 
        
        // ------------------------------- AFILIADOS DEL INTERIOR -------------------------------------------//
        const dptosValleCentral = [7, 8, 16];
        if (!dptosValleCentral.includes(result.cdpt)){
            prioridad = {
                nombre: result.anrz,
                dni: result.nroi,
                motivo: "AFILIADO DEL INTERIOR"
            }
        }
        console.log(prioridad);
        
        // ----------------------------------- AFILIADOS CON ART ---------------------------------------------//
        let fechaInicioArt = result.fiat;
        let fechaFinArt = result.fcat;
        if (fechaInicioArt !== null && fechaFinArt !== null){
            if (hoy >= fechaInicioArt && hoy <= fechaFinArt) {
                prioridad = {
                    nombre: result.anrz,
                    dni: result.nroi,
                    motivo: "ACCIDENTE DE TRABAJO"
                }                
            }
        }

        // -------------------------------- AFILIADOS MAYOR DE EDAD ---------------------------------------------//
        if(result.edad >=65){
            prioridad = {
                nombre: result.anrz,
                dni: result.nroi,
                motivo: "MAYOR DE EDAD"
            }
        }
      
        if (prioridad !== null) {
            res.json(prioridad);
        }
        
    } catch (error) {
        console.log(error);      
        
    }
}

