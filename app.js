// URL de tu servidor local
const API_URL = "http://localhost:3000/solicitudes";

// ============================================================================
// CONEXIÓN CON EL SERVIDOR LOCAL (HTTP GET / POST)
// ============================================================================

// Función para enviar una nueva solicitud al servidor local
async function registrarSolicitud() {
    const usuario = document.getElementById('user-id').value;
    const inicio = parseInt(document.getElementById('time-start').value);
    const fin = parseInt(document.getElementById('time-end').value);

    if (!usuario || isNaN(inicio) || isNaN(fin) || inicio >= fin) {
        alert("Por favor ingresa datos congruentes. El tiempo de inicio debe ser menor al de finalización.");
        return;
    }

    const nuevaPeticion = {
        usuario: usuario,
        inicio: inicio,
        fin: fin,
        tokenOrder: Math.floor(Math.random() * 10) + 1 // Prioridad/Orden aleatorio
    };

    const consola = document.getElementById('consola-logs');

    try {
        consola.innerHTML = `<span class="text-blue-400">[CONNECTING]</span> Enviando petición a ${API_URL}...`;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaPeticion)
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const datosGuardados = await response.json();
        consola.innerHTML = `<span class="text-emerald-400">[HTTP POST 201]</span> Solicitud registrada localmente para: <strong>${datosGuardados.usuario}</strong>`;
        
    } catch (error) {
        console.error(error);
        consola.innerHTML = `<span class="text-red-400">[CORS / CONNECTION ERROR]:</span> No se pudo conectar con el servidor local en <code class="bg-slate-950 px-1 rounded text-red-300">localhost:3000</code>.<br><br><span class="text-slate-400 text-[11px]">Asegúrate de que tu backend esté encendido y tenga CORS habilitado.</span>`;
    }
}

// Función auxiliar para obtener todas las solicitudes desde el servidor local
async function obtenerSolicitudesDelServidor() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        document.getElementById('consola-logs').innerHTML = `<span class="text-red-400">[ERROR FETCH]</span> No se pudieron recuperar los datos de <code class="bg-slate-950 px-1 rounded text-red-300">localhost:3000</code>.`;
        return null;
    }
}

// ============================================================================
// PARADIGMA 1: ALGORITMO VORAZ (GREEDY) - SELECCIÓN DE ACTIVIDADES
// ============================================================================
async function ejecutarPlanificadorVoraz() {
    const consola = document.getElementById('consola-logs');
    consola.innerHTML = `<span class="text-blue-400">[FETCHING]</span> Cargando solicitudes desde el backend...`;

    const peticiones = await obtenerSolicitudesDelServidor();
    
    if (!peticiones || peticiones.length === 0) {
        consola.innerHTML += `<br><span class="text-amber-500">[AVISO]:</span> La lista de solicitudes está vacía o el servidor no responde.`;
        return;
    }

    // Paso Voraz: Ordenar los intervalos por su tiempo de finalización (fin)
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

    let output = `<span class="text-indigo-400 font-bold">--- OPTIMIZACIÓN VORAZ (LOCAL) ---</span><br>`;
    output += `Total solicitudes en base de datos: ${peticiones.length}<br>`;
    output += `Máximo procesable sin colisiones: <span class="text-emerald-400 font-bold">${seleccionadas.length}</span><br><br>`;
    
    seleccionadas.forEach((p, index) => {
        output += `[${index + 1}] ${p.usuario} (${p.inicio}s -> ${p.fin}s)<br>`;
    });

    consola.innerHTML = output;
}

// ============================================================================
// PARADIGMA 2: DIVIDE Y VENCERÁS - CONTEO DE INVERSIONES O(N LOG N)
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
            splitInversions += (izq.length - i);
        }
    }
    return {
        sortedArray: sortedArray.concat(izq.slice(i)).concat(der.slice(j)),
        splitInversions: splitInversions
    };
}

async function ejecutarAnalisisInversiones() {
    const consola = document.getElementById('consola-logs');
    consola.innerHTML = `<span class="text-blue-400">[FETCHING]</span> Cargando tokens desde el backend...`;

    const peticiones = await obtenerSolicitudesDelServidor();
    
    if (!peticiones || peticiones.length < 2) {
        consola.innerHTML = `<span class="text-red-400">[ERROR]:</span> Se requieren al menos 2 peticiones registradas para calcular inversiones de red.`;
        return;
    }

    // Extraemos la secuencia de prioridades/tokens según orden de llegada
    let secuenciaTokens = peticiones.map(p => p.tokenOrder);

    // Algoritmo Divide y Vencerás
    let resultadoAnálisis = countInversionsAndSort(secuenciaTokens);
    
    let n = secuenciaTokens.length;
    let maxPosiblesInversiones = (n * (n - 1)) / 2;
    let tasaDeDesorden = maxPosiblesInversiones > 0 ? (resultadoAnálisis.inversions / maxPosiblesInversiones) * 100 : 0;

    let diagnostico = "TRÁFICO ESTABLE";
    let colorEstilo = "text-emerald-400";

    if (tasaDeDesorden > 50) {
        diagnostico = "ALERTA: TRÁFICO ALTAMENTE ANÓMALO (Simulación de Ataque)";
        colorEstilo = "text-red-400 font-bold";
    }

    let output = `<span class="text-emerald-400 font-bold">--- ANÁLISIS DIVIDE Y VENCERÁS (LOCAL) ---</span><br>`;
    output += `Secuencia de Tokens: [${secuenciaTokens.join(', ')}]<br>`;
    output += `Inversiones calculadas: <span class="font-bold text-white">${resultadoAnálisis.inversions}</span><br>`;
    output += `Tasa de desorden: ${tasaDeDesorden.toFixed(1)}%<br><br>`;
    output += `Diagnóstico: <span class="${colorEstilo}">${diagnostico}</span>`;

    consola.innerHTML = output;
}
