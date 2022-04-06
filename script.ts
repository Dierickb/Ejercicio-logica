const csv = require('csv-parser');
const fs = require('fs');
const results: string[] = [];

const estadoMasAfectado = (dataMasAfectada: any[][]) => {
    const [state, poblation, cantMuertosByState, perDeaded, fecha] = dataMasAfectada;
    const maxDead: number = Math.max(...cantMuertosByState);
    const maxPerDead: number = Math.max(...perDeaded);
    let minDead: number = maxDead;
    let staticMaxDead: any[] = [];
    let staticMaxPerDead: any[] = [];
    let staticMinDead: any[] = [];

    for (let i = 0; i < cantMuertosByState.length - 1; i++) {
        if ( (cantMuertosByState[i] <minDead) && (poblation[i] !==0)  ){//Evito establecer un minimo en datos que no converjan
            minDead = cantMuertosByState[i];
        }
    }

    for (let i = 0; i < state.length; i++) {
        if (cantMuertosByState[i] === maxDead) {
            staticMaxDead = [state[i], poblation[i], cantMuertosByState[i], perDeaded[i].toFixed(3)]
        }
        if (perDeaded[i] === maxPerDead) {
            staticMaxPerDead = [state[i], poblation[i], cantMuertosByState[i], perDeaded[i].toFixed(3)]
        };
        if ( (cantMuertosByState[i] === minDead) && ( poblation[i] !==0 ) ) { //evito que muestre un estado donde los datos no converjan
            staticMinDead = [state[i], poblation[i], cantMuertosByState[i], perDeaded[i].toFixed(3)]
        };
    };

    console.log(`El estado mas afectado a la fecha ${fecha} (MM/DD/YY) en terminos de muertes acomuldas (CON MAYOR CATIDAD ACOMULADA DE MUERTES) fue el estado de ${staticMaxDead[0]} con una cantidad de muertes de ${staticMaxDead[2]}, teniendo una poblacion de ${staticMaxDead[1]} y un porcentaje de muertes del ${staticMaxDead[3]}%`);
    console.log("");
    console.log(`El estado mas afectados a la fecha ${fecha} (MM/DD/YY) en terminos de porcentaje fue ${staticMaxPerDead[0]} con un porcentaje de muertes de ${staticMaxPerDead[3]}%, con una población de ${staticMaxPerDead[1]} y una cantidad de muertes total de ${staticMaxPerDead[2]}`);
    console.log(`${staticMaxPerDead[0]}, sin ninguna duda es el estado mas afectado a la fecha puesto que presenta la mayor cantidad de muertes por habitantes, es decir en relación a la cantidad de habitantes que posee el estado hubo mayor cantidad de muertes`);
    console.log("");
    console.log(`El estado CON MENOR CATIDAD ACOMULADA DE MUERTES a la fecha ${fecha} (MM/DD/YY) fue el estado de ${staticMinDead[0]} con una cantidad de muertes de ${staticMinDead[2]}, teniendo una poblacion de ${staticMinDead[1]} y un porcentaje de muertes del ${staticMinDead[3]}%`);
    console.log("");
    console.log("");
};

const pobMuertState = (filas4: string[][]) => {
    let stateInitial = filas4[1][6]; //Cargo stateInitial con el valor del estado de la segunda fila del array
    let j = 0;
    let i = 0;
    let state: string[] = [];
    let poblation: number[] = [];
    let muertosByEstado: number[] = [];
    let fecha: string = filas4[0][filas4[0].length -1];
    let count = 0;
    let countMuertos = 0;
    let stadisticData: any[] = [];
    for (let datos of filas4) { //Recorro las filas del array
        if (j !== 0) { //Evito leer el array en la posicion del estado en la posicion cero del array, esta posición contiene los titles
            if (datos[6] === stateInitial) { //Es el estado de la fila igual al inicial ?
                count = count + parseInt(datos[11]);
                state[i] = stateInitial;
                countMuertos = countMuertos + parseInt(datos[datos.length - 1]);
                i = i;
            } else {
                stateInitial = filas4[j][6]; //Si el estado de la fila es diferente al seteado en stateInitial cambio el valor de stateInitial por el nuevo estado 
                poblation[i] = count;
                muertosByEstado[i] = countMuertos;
                count = parseInt(datos[11]);// Seteo el valor del contador de la población con la poblacion inicial del nuevo estado
                countMuertos = parseInt(datos[datos.length - 1]); // Seteo el valor del contador de muertos con la cantidad acomulada final de muertos inicial del nuevo estado
                i = i + 1;
                state[i] = stateInitial;
                if (poblation.length < state.length) { // A causa del propio diseño cuando se leen todos los estados no se termina de leer toda la cantidad de poblacion y de muertos del ultimo estado
                    // Por lo que así se termina de leer la cantidad de pobación y de muertos del ultimo estado
                    poblation[state.length - 1] = count + parseInt(datos[11]);
                    muertosByEstado[state.length - 1] = countMuertos + parseInt(datos[datos.length - 1]);
                }
            };
        };

        j = j + 1;
    };

    stadisticData = [state, poblation, muertosByEstado, fecha];

    return stadisticData;
};

const muertesVsPoblacion = (filas3: string[][]) => {
    let muertVsPob: any[][] = [];
    let porcentajeDeMuertos: number[] = [];
    let stadisticData = pobMuertState(filas3);

    for (let i = 0; i < stadisticData[0].length; i++) {
        porcentajeDeMuertos[i] = (stadisticData[2][i] / stadisticData[1][i]) * 100;
    };

    console.log("");
    console.log("A continuación una lista de los estados con el porcentaje de fallecidos total_muertos/población");

    for (let i = 0; i < stadisticData[0].length; i++) {
        if (isNaN(porcentajeDeMuertos[i])) {
            porcentajeDeMuertos[i] = 0;
            console.log(`${stadisticData[0][i]}: No se tiene suficiente información o datos corruptos`)
        } else if (!isFinite(porcentajeDeMuertos[i])) {
            porcentajeDeMuertos[i] = 0;
            console.log(`${stadisticData[0][i]}: No se tiene suficiente información o datos corruptos`)
        } else {
            console.log(`${stadisticData[0][i]}: ${porcentajeDeMuertos[i].toFixed(3)}%`)
        };

    };
    console.log("");
    console.log("");
    muertVsPob = [stadisticData[0], stadisticData[1], stadisticData[2], porcentajeDeMuertos, stadisticData[3]]
    return (muertVsPob)
};

const objectToArray = (objectCsv: string[]) => {
    let masAfectado: any[][] = [];
    let arg: string[][] = [];

    for (let i = 0; i < (objectCsv.length - 1); i++) {
        arg[i] = Object.values(results[i])
    };
    masAfectado = muertesVsPoblacion(arg);
    estadoMasAfectado(masAfectado);
};

fs.createReadStream('time_series_covid19_deaths_US.csv') //URL relativa al script
    .pipe(csv([]))
    .on('data', (data: any) => results.push(data))
    .on('end', () => {
        objectToArray(results);
    });