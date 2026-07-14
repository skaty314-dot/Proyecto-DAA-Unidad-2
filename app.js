JavaScript
// Endpoint del backend local en Express
const API_URL = "http://localhost:3000/solicitudes";

// Estado de sesión del usuario local
let usuarioActivo = null;

// ============================================================================
// 1. CONTROL DE INICIO Y CIERRE DE SESIÓN
// ============================================================================

function iniciarSesion() {
    const inputUser = document.getElementById('username-input').value.trim();
    
    if (!inputUser) {
        alert("Por favor ingresa un nombre de usuario válido para iniciar sesión.");
        return;
    }

    usuarioActivo = inputUser;

    // Guardar en sessionStorage para persistencia básica
    sessionStorage.setItem('usuarioActivo', usuarioActivo);
    actualizarVistaSesion();

    document.getElementById('consola-logs').innerHTML = `<span class="text-emerald-400">[LOGIN_SUCCESS]</span> Bienvenido, <strong>${usuarioActivo}</strong>. Formulario de compras desbloqueado.`;
}

function cerrarSesion() {
    document.getElementById('consola-logs').innerHTML = `<span class="text-amber-500">[LOGOUT]</span> Sesión cerrada para: <strong>${usuarioActivo}</strong>.`;
    
    usuarioActivo = null;
    sessionStorage.removeItem('usuarioActivo');
    actualizarVistaSesion();
}

function actualizarVistaSesion() {
    const loggedOutDiv = document.getElementById('logged-out-state');
    const loggedInDiv = document.getElementById('logged-in-state');
    const activeUserSpan = document.getElementById('active-user');
    
    // Inputs del formulario de compra
    const itemName = document.getElementById('item-name');
    const itemQty = document.getElementById('item-qty');
    const itemPrice = document.getElementById('item-price');
    const btnRegistrar = document.getElementById('btn-registrar');

    if (usuarioActivo) {
        // Interfaz Autenticada
        loggedOutDiv.classList.add('hidden');
        loggedInDiv.classList.remove('hidden');
        activeUserSpan.innerText = usuarioActivo;

        // Desbloquear Formulario de Compras
        itemName.disabled = false;
        itemName.classList.remove('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemName.classList.add('bg-slate-950', 'text-slate-200');

        itemQty.disabled = false;
        itemQty.classList.remove('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemQty.classList.add('bg-slate-950', 'text-slate-200');

        itemPrice.disabled = false;
        itemPrice.classList.remove('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemPrice.classList.add('bg-slate-950', 'text-slate-200');

        btnRegistrar.disabled = false;
        btnRegistrar.classList.remove('bg-slate-700', 'text-slate-400', 'cursor-not-allowed');
        btnRegistrar.classList.add('bg-indigo-600', 'hover:bg-indigo-500', 'text-white', 'cursor-pointer');
    } else {
        // Interfaz Invitado
        loggedOutDiv.classList.remove('hidden');
        loggedInDiv.classList.add('hidden');
        document.getElementById('username-input').value = "";

        // Bloquear Formulario de Compras
        itemName.disabled = true;
        itemName.classList.add('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemName.classList.remove('bg-slate-950', 'text-slate-200');

        itemQty.disabled = true;
        itemQty.classList.add('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemQty.classList.remove('bg-slate-950', 'text-slate-200');

        itemPrice.disabled = true;
        itemPrice.classList.add('bg-slate-950/50', 'text-slate-500', 'cursor-not-allowed');
        itemPrice.classList.remove('bg-slate-950', 'text-slate-200');

        btnRegistrar.disabled = true;
        btnRegistrar.classList.add('bg-slate-700', 'text-slate-400', 'cursor-not-allowed');
        btnRegistrar.classList.remove('bg-indigo-600', 'hover:bg-indigo-500', 'text-white', 'cursor-pointer');
    }
}

// ============================================================================
// 2. PETICIONES HTTP DE COMPRAS (POST / GET)
// ============================================================================

// Registrar una nueva solicitud de compra en el localhost
async function registrarCompra() {
    if (!usuarioActivo) {
        alert("Primero debes iniciar sesión.");
        return;
    }

    const articulo = document.getElementById('item-name').value.trim();
    const cantidad = parseInt(document.getElementById('item-qty').value);
    const precio = parseFloat(document.getElementById('item-price').value);
    const consola = document.getElementById('consola-logs');

    if (!articulo || isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
        alert("Por favor rellena correctamente los campos de compra.");
        return;
    }

    // Datos estructurados a enviar
    const nuevaCompra = {
        usuario: usuarioActivo,
        articulo: articulo,
        cantidad: cantidad,
        precioTotal: (cantidad * precio).toFixed(2),
        timestamp: new Date().toLocaleTimeString()
    };

    try {
        consola.innerHTML = `<span class="text-blue-400">[POST_ATTEMPT]</span> Enviando registro de compra a Localhost...`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaCompra)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        consola.innerHTML = `<span class="text-emerald-400">[SUCCESS POST 201]</span> Solicitud aprobada.<br>` +
                             `Artículo: ${data.articulo}<br>` +
                             `Costo Total: $${data.precioTotal} USD<br>` +
                             `Registrado por: ${data.usuario}`;
        
    } catch (error) {
        console.error(error);
        consola.innerHTML = `<span class="text-red-400">[CONNECTION_ERROR]</span> No se pudo establecer conexión con <code class="bg-slate-950 p-1 text-red-300">localhost:3000/solicitudes</code>.<br><br>` +
                            `<span class="text-slate-400 text-xs">Comprueba que el backend local esté activo en tu máquina y que admita llamadas CORS.</span>`;
    }
}

// Cargar y mostrar el listado de solicitudes para Soporte técnico
async function cargarSolicitudes() {
    const consola = document.getElementById('consola-logs');
    consola.innerHTML = `<span class="text-indigo-400">[GET_ATTEMPT]</span> Recuperando historial de solicitudes locales...`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const solicitudes = await response.json();

        if (solicitudes.length === 0) {
            consola.innerHTML = `<span class="text-amber-500">[INFO]</span> El servidor local respondió, pero la lista de solicitudes de compra está vacía actualmente.`;
            return;
        }

        let htmlContent = `<span class="text-indigo-400 font-bold">--- HISTORIAL DE SOLICITUDES LOCAL ---</span><br>`;
        solicitudes.forEach((s, i) => {
            htmlContent += `[${i + 1}] <strong>${s.usuario}</strong> compró "${s.articulo}" (${s.cantidad} unidades) por <span class="text-emerald-400">$${s.precioTotal} USD</span> a las ${s.timestamp || 'N/A'}<br>`;
        });

        consola.innerHTML = htmlContent;

    } catch (error) {
        console.error(error);
        consola.innerHTML = `<span class="text-red-400">[CONNECTION_ERROR]</span> Error al obtener las solicitudes desde localhost.<br><br>` +
                            `<span class="text-slate-400 text-xs">Asegúrate de que tu puerto de backend esté configurado correctamente.</span>`;
    }
}

// Detectar sesión al recargar la página
window.onload = () => {
    const savedUser = sessionStorage.getItem('usuarioActivo');
    if (savedUser) {
        usuarioActivo = savedUser;
        actualizarVistaSesion();
    }
};