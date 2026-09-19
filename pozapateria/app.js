// ===== CONFIGURACIÓN DE LA API =====
const API_URL = 'http://localhost:3000/api';

// ===== ESTADO DEL CARRITO =====
let cart = [];

// ===== DOM ELEMENTS =====
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');

const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLoginBtn = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');

const addToCartButtons = document.querySelectorAll('.add-to-cart');

// ===== FUNCIONES DEL CARRITO =====
function addToCart(productId, title, price) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
    showNotification(`${title} - Cantidad actualizada`);
  } else {
    cart.push({
      id: productId,
      title: title,
      price: parseFloat(price),
      quantity: 1
    });
    showNotification(`✅ ${title} añadido al carrito`);
  }

  updateCartUI();
  saveCartToLocalStorage();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  saveCartToLocalStorage();
  showNotification('Producto eliminado del carrito');
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
      saveCartToLocalStorage();
    }
  }
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">Añade algún producto para empezar</p>
      </div>
    `;
    totalAmount.textContent = '0.00';
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">👟</div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.title}</h4>
          <p class="cart-item-price">$${item.price.toFixed(2)} cada uno</p>
          <div class="cart-item-controls">
            <div class="cart-item-quantity">
              <button onclick="updateQuantity('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <p style="margin-left: auto; font-weight: 700;">$${(item.price * item.quantity).toFixed(2)}</p>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toFixed(2);
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('pozapateriaCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('pozapateriaCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

function showNotification(message, isError = false) {
  // Remover notificaciones existentes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : ''}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${isError ? 'var(--minecraft-red)' : 'var(--minecraft-green)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// ===== FUNCIONES DE MODAL =====
function openCartModal() {
  cartModal.classList.add('open');
  updateCartUI();
}

function closeCartModal() {
  cartModal.classList.remove('open');
}

function openLoginModal() {
  loginModal.style.display = 'flex';
}

function closeLoginModal() {
  loginModal.style.display = 'none';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = e.target[0].value;
  
  showNotification(`¡Bienvenido, ${email.split('@')[0]}!`);
  closeLoginModal();
  e.target.reset();
  
  loginBtn.innerHTML = '👤 Cerrar Sesión';
  loginBtn.onclick = () => {
    loginBtn.innerHTML = '👤 Iniciar Sesión';
    loginBtn.onclick = openLoginModal;
    showNotification('Sesión cerrada');
  };
}

async function handleCheckout() {
  if (cart.length === 0) {
    showNotification('Tu carrito está vacío', true);
    return;
  }
  
  try {
    // Crear pedido en la API
    const orderData = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      showNotification('✅ ¡Compra finalizada! Gracias por tu pedido.');
      cart = [];
      updateCartUI();
      saveCartToLocalStorage();
      closeCartModal();
    } else {
      throw new Error('Error al crear el pedido');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('⚠️ Error al procesar el pedido. Intente nuevamente.', true);
  }
}

// ===== CARGAR PRODUCTOS DESDE LA API =====
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al cargar productos');
    
    const products = await response.json();
    const productsGrid = document.getElementById('products-grid');
    
    if (productsGrid && products.length > 0) {
      productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image">${product.imagen || '👟'}</div>
          <div class="product-info">
            <h3 class="product-name">${product.nombre}</h3>
            <p class="product-description">${product.descripcion || ''}</p>
            <div class="product-footer">
              <span class="product-price">$${product.precio.toFixed(2)}</span>
              <span class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
              </span>
            </div>
            <button class="btn btn-primary add-to-cart" 
                    data-id="${product.id}" 
                    data-title="${product.nombre}" 
                    data-price="${product.precio}"
                    ${product.stock === 0 ? 'disabled' : ''}
                    style="width: 100%; margin-top: 1rem; justify-content: center;">
              ${product.stock > 0 ? '🛒 Agregar al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
      `).join('');

      // Re-asignar event listeners a los nuevos botones
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          const card = e.target.closest('.product-card');
          const id = card.dataset.id;
          const title = card.querySelector('.product-name').textContent;
          const price = card.querySelector('.product-price').textContent.replace('$', '');
          addToCart(id, title, price);
        });
      });
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
    showNotification('⚠️ Error al cargar productos. Usando datos locales.', true);
  }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Cargar carrito desde localStorage
  loadCartFromLocalStorage();

  // Cargar productos desde API
  loadProducts();

  // Configurar botones del carrito
  if (cartBtn) cartBtn.addEventListener('click', openCartModal);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

  // Configurar login
  if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
  if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

  // Configurar botones de agregar al carrito existentes
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card, .book-card');
      if (card) {
        const id = card.dataset.id;
        const title = card.dataset.title || card.querySelector('.product-name, .book-title')?.textContent;
        const price = card.dataset.price || card.querySelector('.product-price, .book-price')?.textContent.replace('$', '');
        addToCart(id, title, price);
      }
    });
  });
});

// Cerrar modales al hacer clic fuera
if (cartModal) {
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
  });
}

if (loginModal) {
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
  });
}

// Cerrar modales con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (cartModal && cartModal.classList.contains('open')) closeCartModal();
    if (loginModal && loginModal.style.display === 'flex') closeLoginModal();
  }
});

// ===== ANIMACIONES CSS =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Animaciones de entrada escalonadas */
  .product-card, .book-card {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }
  
  .product-card:nth-child(1), .book-card:nth-child(1) { animation-delay: 0.1s; }
  .product-card:nth-child(2), .book-card:nth-child(2) { animation-delay: 0.2s; }
  .product-card:nth-child(3), .book-card:nth-child(3) { animation-delay: 0.3s; }
  .product-card:nth-child(4), .book-card:nth-child(4) { animation-delay: 0.4s; }
  .product-card:nth-child(5), .book-card:nth-child(5) { animation-delay: 0.5s; }
  .product-card:nth-child(6), .book-card:nth-child(6) { animation-delay: 0.6s; }
`;
document.head.appendChild(style);
