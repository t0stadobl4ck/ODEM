# 🏪 Backend - PoZapateria API

Backend RESTful para la tienda de zapatos **PoZapateria**, construido con **Node.js + Express + SQLite**.

## 🚀 Características

- ✅ API REST completa para gestión de productos (zapatos)
- ✅ Base de datos SQLite con datos de ejemplo
- ✅ Gestión de pedidos y carrito de compras
- ✅ CORS habilitado para conectar con el frontend
- ✅ 12 productos de ejemplo pre-cargados

## 📦 Endpoints de la API

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/productos` | Obtener todos los productos |
| `GET` | `/api/productos?categoria=Deportivos` | Filtrar por categoría |
| `GET` | `/api/productos/:id` | Obtener producto por ID |
| `GET` | `/api/categorias` | Obtener todas las categorías |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/pedidos` | Crear nuevo pedido |
| `GET` | `/api/pedidos` | Obtener todos los pedidos |
| `GET` | `/api/pedidos/cliente/:clienteId` | Pedidos de un cliente |
| `PATCH` | `/api/pedidos/:id` | Actualizar estado del pedido |

## 🛠️ Instalación

```bash
cd backend
npm install
```

## ▶️ Ejecución

```bash
npm start
```

El servidor se ejecutará en: **http://localhost:3000**

## 🧪 Probar la API

### Obtener todos los productos:
```bash
curl http://localhost:3000/api/productos
```

### Obtener productos por categoría:
```bash
curl http://localhost:3000/api/productos?categoria=Deportivos
```

### Obtener un producto específico:
```bash
curl http://localhost:3000/api/productos/1
```

### Crear un pedido:
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Juan Pérez",
    "items": [
      {"productoId": 1, "cantidad": 2, "precio": 129.99}
    ],
    "total": 259.98,
    "direccion": "Calle Principal 123"
  }'
```

## 📊 Estructura de Datos

### Producto
```json
{
  "id": 1,
  "nombre": "Nike Air Max",
  "descripcion": "Zapatillas deportivas...",
  "precio": 129.99,
  "categoria": "Deportivos",
  "marca": "Nike",
  "talla": "40-45",
  "color": "Blanco/Negro",
  "stock": 50,
  "imagen": "👟"
}
```

### Pedido
```json
{
  "id": 1,
  "cliente": "Juan Pérez",
  "items": [...],
  "total": 259.98,
  "direccion": "Calle Principal 123",
  "fecha": "2025-01-15T10:30:00.000Z",
  "estado": "pendiente"
}
```

## 🗂️ Categorías Disponibles

- 👟 **Deportivos**: Nike, Adidas, New Balance
- 👟 **Casual**: Vans, Converse, Puma, Reebok, Crocs
- 🥾 **Botas**: Timberland, Dr. Martens
- 👞 **Formal**: Clarks, Gucci

## 📁 Estructura del Proyecto

```
backend/
├── server.js        # Servidor Express y rutas API
├── database.js      # Configuración de SQLite y datos
├── zapateria.db     # Base de datos SQLite (auto-generada)
└── package.json     # Dependencias y scripts
```

## 🔌 Conexión con el Frontend

El frontend puede consumir la API usando `fetch`:

```javascript
// Obtener productos
const response = await fetch('http://localhost:3000/api/productos');
const productos = await response.json();

// Crear pedido
const pedido = await fetch('http://localhost:3000/api/pedidos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente: 'Cliente',
    items: carrito,
    total: total
  })
});
```

---

**Hecho con ❤️ para PoZapateria**
