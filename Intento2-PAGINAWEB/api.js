// ============================================================
//  api.js  —  Strawberry Kiss · Cliente de la API
// ============================================================

const API_BASE = '/api';

// ---------- Token JWT ----------
function getToken()        { return localStorage.getItem('sk_token'); }
function setToken(t)       { localStorage.setItem('sk_token', t); }
function removeToken()     { localStorage.removeItem('sk_token'); localStorage.removeItem('sk_usuario'); }
function getUsuario()      { return JSON.parse(localStorage.getItem('sk_usuario') || 'null'); }
function setUsuario(u)     { localStorage.setItem('sk_usuario', JSON.stringify(u)); }
function estaLogueado()    { return !!getToken(); }

// ---------- Fetch autenticado ----------
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + url, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ---------- Auth ----------
async function login(email, password) {
  const { ok, data } = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (ok && data.token) { setToken(data.token); setUsuario(data.usuario); }
  return { ok, data };
}

async function registro(nombre, email, password, confirmPassword) {
  const { ok, data } = await authFetch('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password, confirmPassword })
  });
  if (ok && data.token) { setToken(data.token); setUsuario(data.usuario); }
  return { ok, data };
}

function logout() {
  authFetch('/auth/logout', { method: 'POST' }).catch(() => {});
  removeToken();
  window.location.href = 'login.html';
}

// ---------- Carrito ----------
async function getCarrito() {
  if (!estaLogueado()) return { ok: false, data: { carrito: { productos: [] } } };
  return authFetch('/carrito');
}

async function agregarAlCarrito(productoId, nombre, precio, cantidad = 1, imagen = '', categoria = '') {
  if (!estaLogueado()) { mostrarModalLogin(); return { ok: false }; }
  return authFetch('/carrito/agregar', {
    method: 'POST',
    body: JSON.stringify({ productoId, nombre, precio, cantidad, imagen, categoria })
  });
}

async function actualizarCantidadCarrito(productoId, cantidad) {
  return authFetch(`/carrito/actualizar/${productoId}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad })
  });
}

async function eliminarDelCarrito(productoId) {
  return authFetch(`/carrito/eliminar/${productoId}`, { method: 'DELETE' });
}

async function vaciarCarrito() {
  return authFetch('/carrito/vaciar', { method: 'DELETE' });
}

// ---------- Pagos ----------
async function procesarPago(datos) {
  return authFetch('/pagos/procesar', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

async function getOrdenes() {
  return authFetch('/pagos/ordenes');
}

// ---------- UI helpers ----------
function mostrarModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) { modal.style.display = 'flex'; return; }

  // Crear modal en el vuelo
  const div = document.createElement('div');
  div.id = 'modal-login';
  div.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,.6);z-index:9999;display:flex;
    align-items:center;justify-content:center;`;
  div.innerHTML = `
    <div style="background:white;padding:30px;border-radius:15px;max-width:380px;width:90%;text-align:center;">
      <h2 style="color:#f35a7b;margin-bottom:12px;">¡Inicia sesión!</h2>
      <p style="margin-bottom:20px;color:#555;">Necesitas una cuenta para agregar productos al carrito.</p>
      <a href="login.html" style="display:inline-block;background:#f35a7b;color:white;
         padding:12px 30px;border-radius:10px;text-decoration:none;font-weight:bold;margin-right:10px;">
         Ir a Login
      </a>
      <button onclick="document.getElementById('modal-login').remove()"
        style="background:#ddd;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;font-size:15px;">
        Cerrar
      </button>
    </div>`;
  document.body.appendChild(div);
}

function actualizarNavUsuario() {
  const contenedor = document.getElementById('nav-usuario');
  if (!contenedor) return;
  const usuario = getUsuario();
  if (usuario) {
    contenedor.innerHTML = `
      <span style="color:white;font-size:18px;font-weight:bold;">👤 ${usuario.nombre}</span>
      <button onclick="logout()" style="margin-left:15px;background:#c0392b;color:white;
        border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:16px;">Salir</button>`;
  } else {
    contenedor.innerHTML = `
      <a href="login.html" style="color:white;font-size:18px;font-weight:bold;text-decoration:none;">
        🔑 Iniciar Sesión
      </a>`;
  }
}
