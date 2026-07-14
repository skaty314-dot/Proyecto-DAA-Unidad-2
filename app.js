// ============================================================================
// 1. ALGORITMO VORAZ: SELECCIÓN DE ACTIVIDADES PARA VENTANAS DE SESIÓN
// ============================================================================
function optimizarSolicitudes() {
    // Definimos las solicitudes con [ID, tiempo_inicio, tiempo_fin]
    let solicitudes = [
        { id: "S1 (User_Alpha)", inicio: 1, fin: 4 },
        { id: "S2 (User_Beta)", inicio: 3, fin: 5 },
        { id: "S3 (User_Gamma)", inicio: 0, fin: 6 },
        { id: "S4 (User_Delta)", inicio: 5, fin: 7 },
        { id: "S5 (User_Epsilon)", inicio: 8, fin: 9 },
        { id: "S6 (User_Zeta)", inicio: 5, fin: 9 }
    ];

    // Paso voraz: Ordenar las solicitudes por su tiempo de finalización (fin)
    solicitudes.sort((a, b) => a.fin - b.fin);

    let seleccionadas = [];
    // La primera solicitud siempre se selecciona en el enfoque voraz óptimo
    seleccionadas.push(solicitudes[0]);
    let tiempoFinUltima = solicitudes[0].fin;

    // Recorrer el resto de solicitudes
    for (let i = 1; i < solicitudes.length; i++) {
        // Si el tiempo de inicio es mayor o igual al tiempo de fin de la última aceptada
        if (solicitudes[i].inicio >= tiempoFinUltima) {
            seleccionadas.push(solicitudes[i]);
            tiempoFinUltima = solicitudes[i].fin; // Actualizar marcador
        }
    }

    // Renderizar resultados en la interfaz
    const box = document.getElementById('resultado-voraz-box');
    const txt = document.getElementById('resultado-voraz');
    box.classList.remove('hidden');

    let htmlResult = `<strong>Solicitudes aceptadas (${seleccionadas.length}):</strong><br>`;
    seleccionadas.forEach(s => {
        htmlResult += `• <span class="text-indigo-400">${s.id}</span> [Ventana: ${s.inicio}s - ${s.fin}s]<br>`;
    });
    txt.innerHTML = htmlResult;
}


// ============================================================================
// 2. DIVIDE Y VENCERÁS: CONTEO DE INVERSIONES (DETECCIÓN DE ANOMALÍAS)
// ============================================================================

// Modificación del algoritmo Merge Sort para contar inversiones de forma eficiente: O(n log n)
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
            // Si el elemento de la derecha es menor, hay inversiones con todos los restantes de la izquierda
            splitInversions += (izq.length - i);
        }
    }

    return {
        sortedArray: sortedArray.concat(izq.slice(i)).concat(der.slice(j)),
        splitInversions: splitInversions
    };
}

function detectarAnomalias() {
    const inputStr = document.getElementById('anomalia-input').value;
    const arr = inputStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    if (arr.length === 0) {
        alert("Por favor ingresa un orden secuencial válido.");
        return;
    }

    // Ejecución del algoritmo Divide y Vencerás
    const resultado = countInversionsAndSort(arr);
    const n = arr.length;
    
    // El máximo número posible de inversiones es n * (n - 1) / 2
    const maxInversiones = (n * (n - 1)) / 2;
    const ratioAnomalia = maxInversiones > 0 ? (resultado.inversions / maxInversiones) * 100 : 0;

    let nivelRiesgo = "BAJO";
    let colorRiesgo = "text-emerald-400";
    if (ratioAnomalia > 60) {
        nivelRiesgo = "CRÍTICO (Posible ataque por fuerza bruta / desincronización masiva)";
        colorRiesgo = "text-red-500 font-bold animate-pulse";
    } else if (ratioAnomalia > 25) {
        nivelRiesgo = "MEDIO (Tráfico sospechoso o inestable)";
        colorRiesgo = "text-amber-500 font-bold";
    }

    const box = document.getElementById('resultado-divide-box');
    const txt = document.getElementById('resultado-divide');
    box.classList.remove('hidden');

    txt.innerHTML = `• Número de inversiones detectadas: <span class="text-emerald-400 font-bold">${resultado.inversions}</span><br>` +
                    `• Grado de desorden en peticiones: <span>${ratioAnomalia.toFixed(1)}%</span><br>` +
                    `• Estado del Nivel de Riesgo: <span class="${colorRiesgo}">${nivelRiesgo}</span>`;
}
