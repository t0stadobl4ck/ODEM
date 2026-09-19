const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'zapateria.json');

// Datos iniciales de ejemplo (zapatos)
const datosIniciales = {
  productos: [
    {
      id: 1,
      nombre: 'Nike Air Max',
      descripcion: 'Zapatillas deportivas con tecnología Air Max para máximo confort',
      precio: 129.99,
      categoria: 'Deportivos',
      marca: 'Nike',
      talla: '40-45',
      color: 'Blanco/Negro',
      stock: 50,
      imagen: '👟'
    },
    {
      id: 2,
      nombre: 'Adidas Ultraboost',
      descripcion: 'Zapatillas running con amortiguación Boost',
      precio: 159.99,
      categoria: 'Deportivos',
      marca: 'Adidas',
      talla: '38-44',
      color: 'Negro',
      stock: 35,
      imagen: '👟'
    },
    {
      id: 3,
      nombre: 'Puma RS-X',
      descripcion: 'Zapatillas urbanas con diseño retro',
      precio: 99.99,
      categoria: 'Casual',
      marca: 'Puma',
      talla: '39-45',
      color: 'Multicolor',
      stock: 40,
      imagen: '👟'
    },
    {
      id: 4,
      nombre: 'Vans Old Skool',
      descripcion: 'Clásicas zapatillas skate con rayas laterales',
      precio: 69.99,
      categoria: 'Casual',
      marca: 'Vans',
      talla: '36-44',
      color: 'Negro/Blanco',
      stock: 60,
      imagen: '👟'
    },
    {
      id: 5,
      nombre: 'Converse Chuck Taylor',
      descripcion: 'Las icónicas zapatillas altas de lona',
      precio: 59.99,
      categoria: 'Casual',
      marca: 'Converse',
      talla: '35-45',
      color: 'Rojo',
      stock: 75,
      imagen: '👟'
    },
    {
      id: 6,
      nombre: 'Timberland Classic',
      descripcion: 'Botas resistentes al agua, perfectas para exteriores',
      precio: 189.99,
      categoria: 'Botas',
      marca: 'Timberland',
      talla: '40-46',
      color: 'Marrón',
      stock: 25,
      imagen: '🥾'
    },
    {
      id: 7,
      nombre: 'Dr. Martens 1460',
      descripcion: 'Botas estilo punk rock con suela gruesa',
      precio: 169.99,
      categoria: 'Botas',
      marca: 'Dr. Martens',
      talla: '37-45',
      color: 'Negro',
      stock: 30,
      imagen: '🥾'
    },
    {
      id: 8,
      nombre: 'Oxford Clásico',
      descripcion: 'Zapatos formales de cuero para ocasiones especiales',
      precio: 149.99,
      categoria: 'Formal',
      marca: 'Clarks',
      talla: '39-45',
      color: 'Negro',
      stock: 20,
      imagen: '👞'
    },
    {
      id: 9,
      nombre: 'Derby Italiano',
      descripcion: 'Elegantes zapatos de vestir hechos a mano',
      precio: 199.99,
      categoria: 'Formal',
      marca: 'Gucci',
      talla: '40-44',
      color: 'Marrón',
      stock: 15,
      imagen: '👞'
    },
    {
      id: 10,
      nombre: 'New Balance 574',
      descripcion: 'Zapatillas cómodas para uso diario',
      precio: 89.99,
      categoria: 'Deportivos',
      marca: 'New Balance',
      talla: '38-46',
      color: 'Gris/Azul',
      stock: 45,
      imagen: '👟'
    },
    {
      id: 11,
      nombre: 'Reebok Classic',
      descripcion: 'Zapatillas vintage con estilo atemporal',
      precio: 79.99,
      categoria: 'Casual',
      marca: 'Reebok',
      talla: '36-44',
      color: 'Blanco',
      stock: 50,
      imagen: '👟'
    },
    {
      id: 12,
      nombre: 'Crocs Classic',
      descripcion: 'Zapatos ligeros y cómodos para el hogar o playa',
      precio: 49.99,
      categoria: 'Casual',
      marca: 'Crocs',
      talla: '35-45',
      color: 'Azul',
      stock: 80,
      imagen: '🩴'
    }
  ],
  pedidos: []
};

// Inicializar la base de datos JSON
function initDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(datosIniciales, null, 2));
    console.log('✅ Base de datos JSON creada en:', DB_PATH);
    console.log('✅ Datos de ejemplo insertados (' + datosIniciales.productos.length + ' productos)');
  } else {
    console.log('✅ Base de datos JSON cargada desde:', DB_PATH);
  }
}

// Obtener todos los datos
function getDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo la base de datos:', error.message);
    return datosIniciales;
  }
}

// Guardar datos
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Obtener productos
function getProductos(categoria = null) {
  const db = getDB();
  if (categoria) {
    return db.productos.filter(p => p.categoria === categoria);
  }
  return db.productos;
}

// Obtener producto por ID
function getProductoById(id) {
  const db = getDB();
  return db.productos.find(p => p.id === parseInt(id));
}

// Obtener categorías
function getCategorias() {
  const db = getDB();
  const categorias = [...new Set(db.productos.map(p => p.categoria))];
  return categorias;
}

// Crear pedido
function crearPedido(pedidoData) {
  const db = getDB();
  
  const nuevoPedido = {
    id: db.pedidos.length > 0 ? Math.max(...db.pedidos.map(p => p.id)) + 1 : 1,
    cliente: pedidoData.cliente,
    items: pedidoData.items,
    total: pedidoData.total,
    direccion: pedidoData.direccion || '',
    fecha: new Date().toISOString(),
    estado: 'pendiente'
  };
  
  db.pedidos.push(nuevoPedido);
  
  // Actualizar stock
  pedidoData.items.forEach(item => {
    const producto = db.productos.find(p => p.id === item.productoId);
    if (producto) {
      producto.stock -= item.cantidad;
    }
  });
  
  saveDB(db);
  return nuevoPedido;
}

// Obtener todos los pedidos
function getPedidos() {
  const db = getDB();
  return db.pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Obtener pedidos por cliente
function getPedidosByCliente(clienteId) {
  const db = getDB();
  return db.pedidos
    .filter(p => p.cliente.toLowerCase().includes(clienteId.toLowerCase()))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Actualizar estado de pedido
function actualizarEstadoPedido(id, estado) {
  const db = getDB();
  const pedido = db.pedidos.find(p => p.id === parseInt(id));
  
  if (!pedido) {
    return null;
  }
  
  pedido.estado = estado;
  saveDB(db);
  return pedido;
}

module.exports = {
  initDatabase,
  getDB,
  getProductos,
  getProductoById,
  getCategorias,
  crearPedido,
  getPedidos,
  getPedidosByCliente,
  actualizarEstadoPedido
};
