// ============================================================================
// CONFIGURACIÓN DE LA PLATAFORMA SERVERLESS (MOCK / DEMO AUTÓNOMA)
// ============================================================================
// Para asegurar que tu GitHub Pages sea 100% funcional sin requerir que expongas 
// credenciales reales en texto plano (lo cual reprobaría seguridad en DAA), 
// implementamos un "Mock de Persistencia Serverless In-Memory" ultra-eficiente 
// que emula exactamente las respuestas asíncronas distribuidas de las APIs RESTful.

let databaseMock = [
    { id: 1, usuario: "admin@empresa.com", inicio: 1, fin: 3, tokenOrder: 1 },
    { id: 2, usuario: "user.alpha@gmail.com", inicio: 2, fin: 5, tokenOrder: 3 },
    { id: 3, usuario: "bot.attacker@hack.ru", inicio: 4, fin: 6, tokenOrder: 5 },
    { id: 4, usuario: "manager@empresa.com", inicio: 6, fin: 8, tokenOrder: 2 },
    { id: 5, usuario: "user.beta@gmail.com", inicio: 7, fin: 9, tokenOrder: 4 }
];

let globalIdCounter = 6;

// Simulación de escritura Serverless (Asíncrona)
async function registrarSolicitud() {
    const usuario = document.getElementById('user-id').value;
    const inicio = parseInt(document.getElementById('time-start').value);
    const fin = parseInt(document.getElementById('time-end').value);

    if (!usuario || isNaN(inicio) || isNaN(fin) || inicio >= fin) {
        alert("Por favor ingresa datos congruentes. El tiempo de inicio debe ser menor al de finalización.");
        return;
    }

    // Simulamos la latencia de red de un servicio cloud serverless (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    const nuevaPeticion = {
        id: globalIdCounter++,
        usuario: usuario,
        inicio: inicio,
        fin: fin,
        tokenOrder: Math.floor(Math.random() * 10) + 1 // Orden aleatorio de llegada del paquete de red
    };

    databaseMock.push(nuevaPeticion);
    
    const consola = document.getElementById('consola-logs');
    consola.innerHTML = `<span class="text-indigo-400">[SERVERLESS CLOUD] REST_POST 201:</span> Solicitud guardada con éxito para ${usuario}. Total registros: ${databaseMock.length}`;
}

function limpiarServidor() {
    databaseMock = [];
    document.getElementById('consola-logs').innerHTML = `<span class="text-amber-500">[SERVERLESS CLOUD] PURGE 200:</span> Se han limpiado las tablas temporales de la base de datos.`;
}

// ============================================================================
// PARADIGMA 1: ALGORITMO VORAZ (GREEDY) - SELECCIÓN DE ACTIVIDADES
// ============================================================================
function ejecutarPlanificadorVoraz() {
    const consola = document.getElementById('consola-logs');
    if (databaseMock.length === 0) {
        consola.innerHTML = `<span class="text-red-400">[ERROR]:</span> No hay datos en el servidor para analizar.`;
        return;
    }

    // Clonamos los datos para no alterar la estructura base
    let peticiones = [...databaseMock];

    // Paso Voraz Crucial: Ordenar los intervalos por su tiempo de finalización (fin)
    peticiones.sort((a, b) => a.fin - b.fin);

    let seleccionadas = [];
    seleccionadas.push(peticiones[0]);
    let tiempoFinUltima = peticiones[0].fin;

    for (let i = 1; i < peticiones.length; i++) {
        if (peticiones[i].inicio >= tiempoFinUltima) {
            seleccionadas.push(peticiones[i]);
            tiempoFinUltima = peticiones[i].fin;
        }
    }

    // Renderizado en la consola emulada
    let output = `<span class="text-indigo-400 font-bold">--- RESULTADO OPTIMIZACIÓN GREEDY ---</span><br>`;
    output += `Peticiones totales analizadas en lote: ${peticiones.length}<br>`;
    output += `Máximo de inicios de sesión seguros procesables: <span class="text-emerald-400 font-bold">${seleccionadas.length}</span><br><br>`;
    
    seleccionadas.forEach((p, index) => {
        output += `[${index + 1}] User: ${p.usuario} (Intervalo: ${p.inicio}s -> ${p.fin}s)<br>`;
    });

    consola.innerHTML = output;
}

// ============================================================================
// PARADIGMA 2: DIVIDE Y VENCERÁS - CONTEO DE INVERSIONES EFICIENTE O(N LOG N)
// ============================================================================
function countInversionsAndSort(arr) {
    if (arr.length <= 1) return { arr, inversions: 0 };

    const medio = Math.floor(arr.length / 2);
    const izqResult = countInversionsAndSort(arr.slice(0, medio));
    const derResult = countInversionsAndSort(arr.slice(medio));

    const mergeResult = mergeAndCount(izqResult.arr, derResult.arr);

    return {
        arr: mergeResult.sortedArray,
        inversions: izqResult.inversions + derResult.inversions + mergeResult.splitInversions
    };
}

function mergeAndCount(izq, der) {
    let sortedArray = [];
    let i = 0, j = 0, splitInversions = 0;

    while (i < izq.length && j < der.length) {
        if (izq[i] <= der[j]) {
            sortedArray.push(izq[i]);
            i++;
        } else {
            sortedArray.push(der[j]);
            j++;
            // Propiedad matemática del conteo de inversiones usando Divide y Vencerás
            splitInversions += (izq.length - i);
        }
    }
    return {
        sortedArray: sortedArray.concat(izq.slice(i)).concat(der.slice(j)),
        splitInversions: splitInversions
    };
}

function ejecutarAnalisisInversiones() {
    const consola = document.getElementById('consola-logs');
    if (databaseMock.length < 2) {
        consola.innerHTML = `<span class="text-red-400">[ERROR]:</span> Se requieren al menos 2 peticiones en la base de datos para computar inversiones de red.`;
        return;
    }

    // Extraemos la secuencia de tokens tal como llegaron en la ráfaga
    let secuenciaTokens = databaseMock.map(p => p.tokenOrder);

    // Ejecutamos Divide y Vencerás
    let resultadoAnálisis = countInversionsAndSort(secuenciaTokens);
    
    let n = secuenciaTokens.length;
    let maxPosiblesInversiones = (n * (n - 1)) / 2;
    let tasaDeDesorden = maxPosiblesInversiones > 0 ? (resultadoAnálisis.inversions / maxPosiblesInversiones) * 100 : 0;

    let diagnostico = "TRÁFICO NORMAL";
    let colorEstilo = "text-emerald-400";

    if (tasaDeDesorden > 50) {
        diagnostico = "ALERTA: TRÁFICO ALTAMENTE ANÓMALO (Simulación de ataque DDoS / Desincronización)";
        colorEstilo = "text-red-400 font-bold";
    } else if (tasaDeDesorden > 20) {
        diagnostico = "ADVERTENCIA: Fluctuación menor en paquetes.";
        colorEstilo = "text-amber-400 font-bold";
    }

    let output = `<span class="text-emerald-400 font-bold">--- ANÁLISIS DIVIDE Y VENCERÁS ---</span><br>`;
    output += `Secuencia de Tokens leída del Cloud: [${secuenciaTokens.join(', ')}]<br>`;
    output += `Inversiones de secuencia calculadas: <span class="font-bold text-white">${resultadoAnálisis.inversions}</span><br>`;
    output += `Tasa de desorden métrico: ${tasaDeDesorden.toFixed(1)}%<br><br>`;
    output += `Diagnóstico Serverless: <span class="${colorEstilo}">${diagnostico}</span>`;

    consola.innerHTML = output;
}
