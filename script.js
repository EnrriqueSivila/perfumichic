// Variables globales para el funcionamiento de la tienda
let cart = []; // Array que almacena los productos del carrito
let checkoutModal = null; // Referencia al modal de checkout

// Número de WhatsApp de PERFUMICHIC (Bolivia)
const WHATSAPP_NUMBER = '59164384438';

// Inicialización cuando la página carga completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌸 PERFUMICHIC cargado correctamente');
    
    // Inicializar modal de checkout - obtiene referencia del elemento HTML
    checkoutModal = document.getElementById('checkoutModal');
    
    // Configurar todos los eventos de la página
    setupEvents();
    
    // Configurar animaciones que se activan al hacer scroll
    setupScrollAnimations();
    
    // Configurar navegación suave entre secciones
    setupSmoothScrolling();
    
    // Cargar carrito desde almacenamiento temporal (si existe)
    loadCartFromStorage();
    
    // Actualizar contador visual del carrito
    updateCartCount();
    
    // Inicializar frases rotativas en el hero
    initRotatingPhrases();
    
    console.log('💖 ¡Sistema de carrito inicializado!');
    console.log('📱 WhatsApp integrado: ' + WHATSAPP_NUMBER);
});

// Configurar todos los eventos de la página
function setupEvents() {
    // Evento para el formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Evento para el formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    
    // Eventos para cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
}

// Inicializar frases rotativas en la sección hero
function initRotatingPhrases() {
    const phrases = document.querySelectorAll('.phrase'); // Obtiene todas las frases
    let currentPhrase = 0; // Índice de la frase actual
    
    // Función para cambiar a la siguiente frase
    function rotatePhrases() {
        // Oculta la frase actual
        phrases[currentPhrase].classList.remove('active');
        
        // Pasa a la siguiente frase (vuelve al inicio si llega al final)
        currentPhrase = (currentPhrase + 1) % phrases.length;
        
        // Muestra la nueva frase
        phrases[currentPhrase].classList.add('active');
    }
    
    // Cambia frases cada 3 segundos
    setInterval(rotatePhrases, 3000);
}

// FUNCIONES DEL CARRITO DE COMPRAS

// Agregar producto al carrito
function addToCart(name, price, emoji) {
    // Busca si el producto ya existe en el carrito
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        // Si existe, incrementa la cantidad
        existingItem.quantity += 1;
    } else {
        // Si no existe, lo agrega como nuevo producto
        cart.push({
            name: name,
            price: price,
            emoji: emoji,
            quantity: 1
        });
    }
    
    // Actualiza todas las visualizaciones del carrito
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
    showAddToCartSuccess(name);
    
    console.log('🛒 Producto agregado al carrito:', name);
}

// Eliminar producto completamente del carrito
function removeFromCart(name) {
    // Filtra el array para remover el producto específico
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
    
    console.log('🗑️ Producto eliminado del carrito:', name);
}

// Actualizar cantidad de un producto específico
function updateQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        if (newQuantity <= 0) {
            // Si la nueva cantidad es 0 o menor, elimina el producto
            removeFromCart(name);
        } else {
            // Actualiza la cantidad y refresca las visualizaciones
            item.quantity = newQuantity;
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        }
    }
}

// Actualizar la visualización completa del carrito
function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        // Muestra mensaje de carrito vacío
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px; color: #ccc;"></i>
                <p>Tu carrito está vacío</p>
                <p>¡Agrega algunos perfumes increíbles!</p>
            </div>
        `;
        cartSummary.style.display = 'none';
    } else {
        // Genera HTML para cada producto en el carrito
        const cartItemsHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Bs. ${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        cartContent.innerHTML = `<div class="cart-items">${cartItemsHTML}</div>`;
        cartSummary.style.display = 'block';
        
        // Actualiza el total del carrito
        updateCartTotal();
    }
}

// Actualizar el contador visual del carrito en la navegación
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    // Suma todas las cantidades de productos
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    // Muestra u oculta el contador según si hay productos
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Actualizar el total monetario del carrito
function updateCartTotal() {
    // Calcula el total multiplicando precio por cantidad de cada producto
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        // Formatea el total con separadores de miles
        cartTotal.textContent = `Bs. ${total.toLocaleString('es-BO')}`;
    }
}

// Hacer scroll suave hacia la sección del carrito
function scrollToCart() {
    const cartSection = document.getElementById('carrito');
    if (cartSection) {
        cartSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ALMACENAMIENTO TEMPORAL DEL CARRITO

// Guardar carrito en variable temporal (no usa localStorage por restricciones)
function saveCartToStorage() {
    try {
        // Guarda el carrito como JSON en una variable global
        window.cartData = JSON.stringify(cart);
    } catch (error) {
        console.log('No se puede guardar el carrito');
    }
}

// Cargar carrito desde almacenamiento temporal
function loadCartFromStorage() {
    try {
        if (window.cartData) {
            // Restaura el carrito desde la variable global
            cart = JSON.parse(window.cartData);
            updateCartDisplay();
        }
    } catch (error) {
        console.log('No se puede cargar el carrito guardado');
        cart = [];
    }
}

// MODAL DE CHECKOUT

// Abrir modal de finalización de compra
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos primero.');
        return;
    }
    
    // Llena el resumen del pedido y muestra el modal
    populateOrderSummary();
    checkoutModal.style.display = 'block';
}

// Cerrar modal de checkout
function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

// Llenar el resumen del pedido en el modal
function populateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const finalTotal = document.getElementById('finalTotal');
    
    // Calcula el total del pedido
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Genera HTML para cada producto en el pedido
    const orderItemsHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.emoji} ${item.name} x${item.quantity}</span>
            <span>Bs. ${(item.price * item.quantity).toLocaleString('es-BO')}</span>
        </div>
    `).join('');
    
    // Actualiza el HTML del resumen
    orderSummary.innerHTML = `
        <div class="order-summary">
            <h3><i class="fab fa-whatsapp"></i> Resumen del Pedido</h3>
            ${orderItemsHTML}
            <div class="order-item">
                <span><strong>Total</strong></span>
                <span><strong>Bs. ${total.toLocaleString('es-BO')}</strong></span>
            </div>
        </div>
    `;
    
    finalTotal.textContent = `Bs. ${total.toLocaleString('es-BO')}`;
}

// FUNCIONES DE WHATSAPP

// Crear mensaje de WhatsApp para pedidos
function createWhatsAppMessage(orderData) {
    // Genera lista de productos pedidos
    const cartItemsList = orderData.cart.map(item => 
        `• ${item.emoji} ${item.name} - Cantidad: ${item.quantity} - Precio: Bs. ${item.price} - Subtotal: Bs. ${item.price * item.quantity}`
    ).join('\n');
    
    // Crea el mensaje completo con formato
    const message = `🌸 *NUEVO PEDIDO PERFUMICHIC* 🌸
━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *DATOS DEL CLIENTE:*
• Nombre: ${orderData.customerName}
• Teléfono: ${orderData.customerPhone}
• Dirección: ${orderData.customerAddress}
• Método de Pago: ${orderData.paymentMethod}

🛒 *PRODUCTOS PEDIDOS:*
${cartItemsList}

💰 *TOTAL: Bs. ${orderData.total.toLocaleString('es-BO')}*

📝 *NOTAS ADICIONALES:*
${orderData.customerNotes || 'Ninguna'}

📅 *Fecha del Pedido:* ${orderData.orderDate}

¡Gracias por elegir PERFUMICHIC! 🌸`;

    // Codifica el mensaje para URL
    return encodeURIComponent(message);
}

// Crear mensaje de WhatsApp para contacto general
function createContactWhatsAppMessage(contactData) {
    const message = `📞 *MENSAJE DE CONTACTO - PERFUMICHIC*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *DATOS DEL REMITENTE:*
• Nombre: ${contactData.name}
• Teléfono: ${contactData.phone || 'No proporcionado'}
• Asunto: ${contactData.subject}

💬 *MENSAJE:*
${contactData.message}

📅 *Fecha:* ${contactData.date}`;

    return encodeURIComponent(message);
}

// Enviar pedido por WhatsApp
function sendWhatsAppOrder(orderData) {
    // Crea el mensaje y la URL de WhatsApp
    const message = createWhatsAppMessage(orderData);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    // Abre WhatsApp en una nueva pestaña
    window.open(whatsappURL, '_blank');
    
    // Muestra mensaje de éxito al usuario
    showOrderSuccess(orderData);
    
    // Limpia el carrito después del pedido exitoso
    clearCart();
    closeCheckoutModal();
    
    console.log('📱 Pedido enviado por WhatsApp');
}

// Enviar mensaje de contacto por WhatsApp
function sendWhatsAppContact(contactData) {
    const message = createContactWhatsAppMessage(contactData);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    // Abre WhatsApp en nueva pestaña
    window.open(whatsappURL, '_blank');
    
    // Muestra mensaje de éxito
    showContactSuccess(contactData);
    
    // Limpia el formulario de contacto
    document.getElementById('contactForm').reset();
    
    console.log('📱 Mensaje de contacto enviado por WhatsApp');
}

// Abrir chat directo de WhatsApp con mensaje predefinido
function openWhatsAppChat() {
    const message = encodeURIComponent('¡Hola PERFUMICHIC! 🌸 Me interesa conocer más sobre sus perfumes premium.');
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

// MANEJO DE FORMULARIOS

// Manejar envío del formulario de checkout
function handleCheckoutSubmit(e) {
    e.preventDefault(); // Previene el envío normal del formulario
    
    // Valida que todos los campos estén correctos
    if (!validateCheckoutForm()) {
        alert('Por favor completa todos los campos requeridos correctamente.');
        return;
    }
    
    // Extrae datos del formulario
    const formData = new FormData(e.target);
    const orderData = {
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        customerAddress: formData.get('customerAddress'),
        paymentMethod: formData.get('paymentMethod'),
        customerNotes: formData.get('customerNotes') || 'Ninguna',
        cart: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toLocaleString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Envía el pedido por WhatsApp
    sendWhatsAppOrder(orderData);
}

// Manejar envío del formulario de contacto
function handleContactSubmit(e) {
    e.preventDefault(); // Previene envío normal
    
    // Extrae datos del formulario
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('contactName'),
        phone: formData.get('contactPhone') || 'No proporcionado',
        subject: formData.get('contactSubject'),
        message: formData.get('contactMessage'),
        date: new Date().toLocaleString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Envía mensaje por WhatsApp
    sendWhatsAppContact(contactData);
}

// FUNCIONES DE MENSAJES Y NOTIFICACIONES

// Mostrar mensaje de éxito después de enviar pedido
function showOrderSuccess(orderData) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fab fa-whatsapp" style="margin-right: 10px; color: white; font-size: 1.5rem;"></i>
        <div>
            <strong>¡Pedido Enviado por WhatsApp!</strong><br>
            Gracias ${orderData.customerName}<br>
            Revisa WhatsApp para confirmar tu pedido
        </div>
    `;
    document.body.appendChild(successDiv);
    
    // Remueve el mensaje después de 5 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Mostrar mensaje de éxito después de enviar contacto
function showContactSuccess(contactData) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fab fa-whatsapp" style="margin-right: 10px; color: white; font-size: 1.5rem;"></i>
        <div>
            <strong>¡Mensaje Enviado por WhatsApp!</strong><br>
            Gracias ${contactData.name}<br>
            Te responderemos pronto
        </div>
    `;
    document.body.appendChild(successDiv);
    
    // Remueve mensaje después de 4 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 4000);
}

// Mostrar mensaje cuando se agrega producto al carrito
function showAddToCartSuccess(productName) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
    successDiv.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    successDiv.innerHTML = `
        <i class="fas fa-cart-plus" style="margin-right: 10px; color: #fff;"></i>
        <strong>${productName}</strong><br>
        ¡Agregado al carrito!
    `;
    document.body.appendChild(successDiv);
    
    // Remueve después de 2 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 2000);
}

// Vaciar completamente el carrito
function clearCart() {
    cart = [];
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
    console.log('🧹 Carrito limpiado');
}

// CONFIGURAR ANIMACIONES DE SCROLL

// Configurar animaciones que se activan al hacer scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1, // Se activa cuando el 10% del elemento es visible
        rootMargin: '0px 0px -50px 0px' // Margen para activación temprana
    };
    
    // Observador de intersección para animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Agrega clase 'visible' cuando el elemento entra en vista
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observa todos los elementos con clase fade-in
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// CONFIGURAR NAVEGACIÓN SUAVE

// Configurar scroll suave para enlaces internos
function setupSmoothScrolling() {
    // Selecciona todos los enlaces que apuntan a secciones internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previene comportamiento por defecto
            
            // Encuentra el elemento objetivo
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Calcula posición considerando la navbar fija
                const offsetTop = target.offsetTop - 80;
                
                // Hace scroll suave hasta la posición
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// EFECTOS ADICIONALES PARA MEJORAR LA EXPERIENCIA

// Efectos que se ejecutan cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Efecto de aparición del título principal del hero
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.style.opacity = '1';
            heroTitle.style.animation = 'fadeInUp 1s ease-out';
        }
    }, 300);
    
    // Efecto de aparición progresiva para las tarjetas de productos
    setTimeout(() => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            // Cada carta aparece con un retraso progresivo
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 * (index + 1));
        });
    }, 1000);
});

// FUNCIONES UTILITARIAS

// Formatear precio con moneda boliviana
function formatPrice(price) {
    return `Bs. ${price.toLocaleString('es-BO')}`;
}

// Validar formato de email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar formato de teléfono
function validatePhone(phone) {
    const re = /^[\d\-\+\(\)\s]+$/;
    return re.test(phone) && phone.length >= 8;
}

// VALIDACIONES DE FORMULARIOS

// Validar formulario de checkout antes de enviar
function validateCheckoutForm() {
    const requiredFields = ['customerName', 'customerPhone', 'customerAddress', 'paymentMethod'];
    let isValid = true;
    
    // Revisa cada campo requerido
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            // Campo vacío - marca con borde rojo
            field.style.borderColor = '#ff4757';
            isValid = false;
        } else {
            // Campo válido - marca con borde verde
            field.style.borderColor = '#25d366';
        }
    });
    
    // Validación específica para teléfono
    const phoneField = document.getElementById('customerPhone');
    if (phoneField.value && !validatePhone(phoneField.value)) {
        phoneField.style.borderColor = '#ff4757';
        isValid = false;
    }
    
    return isValid;
}

// EASTER EGG: CÓDIGO KONAMI

// Variables para el código Konami (secuencia especial de teclas)
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

// Detector del código Konami
document.addEventListener('keydown', function(e) {
    // Agrega la tecla presionada al array
    konamiCode.push(e.keyCode);
    // Mantiene solo los últimos 10 códigos
    konamiCode = konamiCode.slice(-10);
    
    // Verifica si coincide con la secuencia Konami
    if (konamiCode.join('') === konamiSequence.join('')) {
        // Easter egg activado - efectos visuales
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 3000);
        
        // Agrega producto gratis al carrito
        addToCart('Perfume Secreto', 0, '🎁');
        
        // Muestra mensaje especial
        const easterDiv = document.createElement('div');
        easterDiv.className = 'success-message';
        easterDiv.innerHTML = `
            <i class="fas fa-gift" style="margin-right: 10px;"></i>
            🎉 ¡Código Konami Activado!<br>
            ¡Perfume secreto agregado gratis!
        `;
        document.body.appendChild(easterDiv);
        
        setTimeout(() => {
            easterDiv.remove();
        }, 4000);
        
        console.log('🎉 ¡Easter egg activado! ¡PERFUMICHIC te saluda!');
    }
});

// EVENT LISTENERS ADICIONALES

// Cerrar modal con la tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && checkoutModal && checkoutModal.style.display === 'block') {
        closeCheckoutModal();
    }
});

// FUNCIONES ADICIONALES DEL CARRITO

// Obtener número total de productos en el carrito
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Obtener total monetario del carrito
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Verificar si el carrito está vacío
function isCartEmpty() {
    return cart.length === 0;
}

// FUNCIÓN PARA MOSTRAR MENSAJE DE WHATSAPP DISPONIBLE

// Mostrar mensaje de bienvenida de WhatsApp
function showWhatsAppWelcome() {
    setTimeout(() => {
        // Solo muestra si existe el botón flotante de WhatsApp
        if (document.querySelector('.whatsapp-float')) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'success-message';
            welcomeDiv.style.bottom = '100px';
            welcomeDiv.style.right = '30px';
            welcomeDiv.style.top = 'auto';
            welcomeDiv.style.left = 'auto';
            welcomeDiv.style.transform = 'none';
            welcomeDiv.style.position = 'fixed';
            welcomeDiv.innerHTML = `
                <i class="fab fa-whatsapp" style="margin-right: 10px; color: white;"></i>
                <div>
                    <strong>¡WhatsApp Disponible!</strong><br>
                    Haz clic para chatear con nosotros
                </div>
            `;
            document.body.appendChild(welcomeDiv);
            
            // Remueve después de 4 segundos
            setTimeout(() => {
                welcomeDiv.remove();
            }, 4000);
        }
    }, 3000); // Espera 3 segundos antes de mostrar
}

// Inicializar mensaje de bienvenida de WhatsApp cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    showWhatsAppWelcome();
});

// LOG DE INICIALIZACIÓN

// Mensajes de consola para desarrollo y depuración
console.log('🌸 PERFUMICHIC JavaScript cargado completamente');
console.log('💖 ¡Disfruta explorando nuestros perfumes!');
console.log('🛒 Sistema de carrito activado');
console.log('📱 WhatsApp integrado: https://wa.me/' + WHATSAPP_NUMBER);
console.log('🎯 Todo listo para enviar pedidos por WhatsApp');

// FUNCIONES DE DEPURACIÓN PARA DESARROLLO

// Objeto global para depuración (solo en desarrollo)
if (typeof window !== 'undefined') {
    window.PERFUMICHIC_DEBUG = {
        cart: () => cart, // Ver contenido del carrito
        clearCart: clearCart, // Limpiar carrito manualmente
        whatsappNumber: WHATSAPP_NUMBER, // Ver número de WhatsApp
        testWhatsApp: () => openWhatsAppChat() // Probar WhatsApp
    };
}