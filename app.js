// ==========================================
// 1. DIVIDE Y VENCERÁS: MERGE SORT
// ==========================================
function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mitad = Math.floor(arr.length / 2);
    const izquierda = arr.slice(0, mitad);
    const derecha = arr.slice(mitad);

    return merge(mergeSort(izquierda), mergeSort(derecha));
}

function merge(izquierda, derecha) {
    let resultado = [];
    let i = 0, j = 0;

    while (i < izquierda.length && j < derecha.length) {
        if (izquierda[i] < derecha[j]) {
            resultado.push(izquierda[i]);
            i++;
        } else {
            resultado.push(derecha[j]);
            j++;
        }
    }
    return resultado.concat(izquierda.slice(i)).concat(derecha.slice(j));
}

function ejecutarMergeSort() {
    const inputStr = document.getElementById('merge-input').value;
    // Convertir el texto en un array de números reales
    const arr = inputStr.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
    
    if(arr.length === 0) {
        alert("Por favor ingresa números válidos separados por comas.");
        return;
    }

    const resultadoArr = mergeSort(arr);
    
    const box = document.getElementById('merge-resultado-box');
    const txt = document.getElementById('merge-resultado');
    box.classList.remove('hidden');
    txt.innerText = `Arreglo Ordenado: [ ${resultadoArr.join(', ')} ]`;
}


// ==========================================
// 2. ALGORITMO VORAZ: MOCHILA FRACCIONARIA
// ==========================================
function mochilaFraccionaria(capacidad, items) {
    // 1. Calcular el valor por unidad de peso para cada objeto
    items.forEach(item => item.proporcion = item.valor / item.peso);
    
    // 2. Ordenar los elementos de manera voraz (de mayor a menor proporción)
    items.sort((a, b) => b.proporcion - a.proporcion);

    let valorTotal = 0;
    let capacidadRestante = capacidad;
    let reporteObjetos = [];

    for (let item of items) {
        if (capacidadRestante === 0) break;

        if (item.peso <= capacidadRestante) {
            // Tomamos el objeto completo
            capacidadRestante -= item.peso;
            valorTotal += item.valor;
            reporteObjetos.push(`100% de ${item.nombre}`);
        } else {
            // Tomamos una fracción del objeto para llenar lo que queda
            let fraccion = capacidadRestante / item.peso;
            valorTotal += item.valor * fraccion;
            reporteObjetos.push(`${(fraccion * 100).toFixed(1)}% de ${item.nombre}`);
            capacidadRestante = 0; // La mochila se llenó
        }
    }

    return { valorTotal, reporteObjetos };
}

function ejecutarMochila() {
    const capacidad = parseFloat(document.getElementById('knapsack-capacity').value);
    
    // Objetos estáticos del ejemplo
    const items = [
        { nombre: 'Item A', peso: 10, valor: 60 },
        { nombre: 'Item B', peso: 20, valor: 100 },
        { nombre: 'Item C', peso: 30, valor: 120 }
    ];

    const resultado = mochilaFraccionaria(capacidad, items);

    const box = document.getElementById('knapsack-resultado-box');
    const txt = document.getElementById('knapsack-resultado');
    box.classList.remove('hidden');
    txt.innerHTML = `<strong>Valor Máximo Obtenido:</strong> $${resultado.valorTotal.toFixed(2)}<br>` +
                    `<strong>Estrategia Voraz:</strong> ${resultado.reporteObjetos.join(' + ')}`;
}
