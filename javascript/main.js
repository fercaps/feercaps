let cart = [];

function agregarAlCarrito(button) {
    const card = button.closest('.card-producto');
    if (!card) return;

    const titleEl = card.querySelector('h3');
    const name = titleEl ? titleEl.innerText : 'Gorra';

    const priceEl = card.querySelector('.precio');
    let price = 19.99;
    if (priceEl) {
        price = parseFloat(priceEl.innerText.replace('$', '').trim()) || 19.99;
    }

    const imgElement = card.querySelector('img');
    const image = imgElement ? imgElement.getAttribute('src') : '';

    const selectTalla = card.querySelector('.input-talla');
    const talla = selectTalla ? selectTalla.value : 'Única';

    const itemId = name + '-' + talla;
    const existing = cart.find(item => item.id === itemId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: itemId,
            name: name,
            price: price,
            image: image,
            talla: talla,
            quantity: 1
        });
    }

    actualizarCarritoHTML();

    // Eliminar cualquier otra ventana flotante de producto abierta
    const oldPopup = document.querySelector('.cart-flotante-producto');
    if (oldPopup) oldPopup.remove();

    // Crear la mini ventana flotante exactamente encima de la tarjeta seleccionada
    const popup = document.createElement('div');
    popup.className = 'cart-flotante-producto';
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">
            <h4 style="font-size: 0.85rem; color: #fff; margin:0;"><i class="fa-solid fa-cart-shopping" style="color:#ff0000;"></i> ¡Agregado!</h4>
            <button onclick="this.closest('.cart-flotante-producto').remove()" style="background:none; border:none; color:#ff0000; font-size:1.2rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <img src="${image}" style="width: 45px; height: 45px; object-fit: contain; background:#000; border-radius:6px; border:1px solid #333;">
            <div>
                <p style="font-size: 0.8rem; color: #fff; font-weight:bold; margin:0; line-height:1.1;">${name}</p>
                <p style="font-size: 0.75rem; color: #aaa; margin:2px 0;">Talla: ${talla}</p>
                <p style="font-size: 0.8rem; color: #ff0000; font-weight:bold; margin:0;">$${price.toFixed(2)}</p>
            </div>
        </div>
        <button onclick="toggleCart(); this.closest('.cart-flotante-producto').remove();" style="width: 100%; background: #ff0000; color: #fff; border: none; padding: 8px; border-radius: 8px; font-weight: bold; font-size: 0.8rem; cursor: pointer;">Ver Carrito Completo</button>
    `;

    card.style.position = 'relative';
    card.appendChild(popup);
    
    // Auto-remover la miniventana flotante después de 5 segundos
    setTimeout(() => {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, 5000);
}

function actualizarCarritoHTML() {
    const contenedor = document.getElementById('cart-items');
    const contador = document.getElementById('cart-count');
    const totalBox = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (contador) contador.innerText = totalItems;

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalBox) totalBox.innerText = '$' + totalPrice.toFixed(2);

    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (cart.length === 0) {
        contenedor.innerHTML = '<p class="empty-msg" style="text-align:center; color:#888; padding:20px;">Tu carrito está vacío</p>';
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;";

        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; background: #000; border-radius: 5px; border: 1px solid #333;">
            <div style="flex: 1; margin-left: 10px; text-align: left;">
                <h4 style="font-size: 0.85rem; margin: 0; color: white;">${item.name}</h4>
                <p style="font-size: 0.8rem; color: #aaa; margin: 2px 0;">Talla: ${item.talla}</p>
                <p style="font-size: 0.85rem; color: #e50914; margin: 0; font-weight: bold;">$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:#ff0000; cursor:pointer; font-size:1.1rem;">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        contenedor.appendChild(div);
    });
}

function eliminarDelCarrito(index) {
    cart.splice(index, 1);
    actualizarCarritoHTML();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
        } else {
            modal.classList.add('active');
            actualizarCarritoHTML();
        }
    }
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('active');
}

function sendOrderWhatsApp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FEER CAPS", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Nota de Pedido / Factura Digital", 105, 28, { align: "center" });
    doc.text("Guayaquil, Ecuador", 105, 34, { align: "center" });

    doc.line(20, 40, 190, 40);

    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.text("Producto", 20, y);
    doc.text("Talla", 120, y);
    doc.text("Cant", 150, y);
    doc.text("Subtotal", 170, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    let total = 0;

    cart.forEach(item => {
        let subtotal = item.price * item.quantity;
        total += subtotal;

        doc.text(item.name.substring(0, 35), 20, y);
        doc.text(String(item.talla), 120, y);
        doc.text(String(item.quantity), 150, y);
        doc.text("$" + subtotal.toFixed(2), 170, y);

        y += 8;
    });

    doc.line(20, y + 2, 190, y + 2);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TOTAL A PAGAR: $" + total.toFixed(2), 170, y, { align: "right" });

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("¡Gracias por tu compra en FEER CAPS!", 105, y, { align: "center" });

    doc.save("Factura_FeerCaps.pdf");

    let mensaje = "🔥 *NUEVO PEDIDO - FEER CAPS* 🔥\n\nHola, acabo de generar mi factura. Aquí el detalle de mi pedido:\n\n";

    cart.forEach(item => {
        let subtotal = item.price * item.quantity;
        mensaje += `🧢 *${item.name}*\n- Talla: ${item.talla}\n- Cantidad: ${item.quantity}\n- Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });

    mensaje += `💰 *TOTAL A PAGAR: $${total.toFixed(2)}*\n\n(Adjunto captura de pantalla para confirmar los modelos exactos).`;

    window.open(`https://wa.me/593999226667?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function ordenarPorPrecio(seccionId, criterio) {
    const section = document.getElementById(seccionId);
    if (!section) return;

    const grid = section.querySelector('.grid-productos');
    const cards = Array.from(grid.querySelectorAll('.card-producto'));

    if (criterio === '') return;

    cards.sort((a, b) => {
        const precioA = parseFloat(a.querySelector('.precio').innerText.replace('$', ''));
        const precioB = parseFloat(b.querySelector('.precio').innerText.replace('$', ''));

        if (criterio === 'menor-mayor') {
            return precioA - precioB;
        } else if (criterio === 'mayor-menor') {
            return precioB - precioA;
        }
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

function abrirZoom(imgElement) {
const card = imgElement.closest('.card-producto');
if (!card) return;

// Si ya está ampliada, la cerramos
if (card.classList.contains('zoom-activo')) {
cerrarZoomActivo(card);
return;
}

// Cerrar cualquier otra tarjeta abierta previamente
document.querySelectorAll('.card-producto.zoom-activo').forEach(c => cerrarZoomActivo(c));

// Activar modo expandido en esta tarjeta
card.classList.add('zoom-activo');

// Crear un botón de cerrar flotante dentro de la tarjeta
const cerrarBtn = document.createElement('button');
cerrarBtn.className = 'btn-cerrar-zoom-local';
cerrarBtn.innerHTML = '&times;';
cerrarBtn.onclick = (e) => {
e.stopPropagation();
cerrarZoomActivo(card);
};
card.appendChild(cerrarBtn);
}

function cerrarZoomActivo(card) {
card.classList.remove('zoom-activo');
const btn = card.querySelector('.btn-cerrar-zoom-local');
if (btn) btn.remove();
}

function cerrarZoom() {
document.querySelectorAll('.card-producto.zoom-activo').forEach(c => cerrarZoomActivo(c));
}

window.addEventListener('click', function(event) {
    const modalCarrito = document. getElementById('cart-modal');
    const modalZoom = document.getElementById('imageZoomModal');

    if (event.target === modalCarrito) {
        modalCarrito.classList.remove('active');
    }
    if (event.target === modalZoom) {
        modalZoom.classList.remove('active');
    }
});
function abrirQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.style.display = 'flex';
}

function cerrarQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.style.display = 'none';
}

function cambiarBancoQR() {
    const select = document.getElementById('selectBancoQR');
    const imgQR = document.getElementById('imgQRToggle');
    const txtBanco = document.getElementById('txtBancoQR');

    if (!select || !imgQR || !txtBanco) return;

    if (select.value === 'pichincha') {
        imgQR.src = 'img/qr-banco1.jpg'; // Imagen QR Banco Pichincha
        txtBanco.innerText = 'Escanea para pagar con Banco Pichincha';
    } else if (select.value === 'guayaquil') {
        imgQR.src = 'img/qr-banco2.jpg'; // Imagen QR Banco Guayaquil
        txtBanco.innerText = 'Escanea para pagar con Banco Guayaquil';
    }
}