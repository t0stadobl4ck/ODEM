const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../')));

// Inicializar base de datos
db.initDatabase();

// ============================================
// RUTAS DE LA API
// ============================================

// Obtener todos los productos (zapatos)
app.get('/api/productos', (req, res) => {
  try {
    const categoria = req.query.categoria;
    const productos = db.getProductos(categoria);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  try {
    const id = req.params.id;
    const producto = db.getProductoById(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  try {
    const categorias = db.getCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear un pedido
app.post('/api/pedidos', (req, res) => {
  try {
    const { cliente, items, total, direccion } = req.body;
    
    if (!cliente || !items || items.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    const pedido = db.crearPedido({ cliente, items, total, direccion });
    res.status(201).json({ 
      message: 'Pedido creado exitosamente',
      pedido 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
  try {
    const pedidos = db.getPedidos();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Obtener pedidos por cliente
app.get('/api/pedidos/cliente/:clienteId', (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    const pedidos = db.getPedidosByCliente(clienteId);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Actualizar estado de un pedido
app.patch('/api/pedidos/:id', (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ error: 'Estado requerido' });
    }
    
    const pedido = db.actualizarEstadoPedido(id, estado);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json({ message: 'Pedido actualizado exitosamente', pedido });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 API disponible en http://localhost:${PORT}/api`);
  console.log(`🏠 Frontend disponible en http://localhost:${PORT}`);
});
