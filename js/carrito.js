// Variable global para almacenar los productos
let productos = [];

// Función para cargar los productos desde un archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('https://xx-asnik-xx.github.io/Entrega-Final-Js-Sassone-Nicolas/db/db.json');
        productos = await response.json();
        mostrarProductos(); // Llamar a mostrarProductos después de cargar los productos
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        productos = []; // Vaciar el array en caso de error
    }
}

// Función para mostrar los productos en la tienda
function mostrarProductos() {
    const productosDiv = document.getElementById("productos");
    productosDiv.innerHTML = "";

    productos.forEach(producto => {
        const productoDiv = document.createElement("div");
        productoDiv.classList.add("producto");
        productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <p>${producto.descripcion}</p>
            <p>Precio: U$S ${producto.precio}</p>
            <p>Stock: ${producto.stock}</p>
            <input type="number" id="cantidad-${producto.id}" min="1" max="${producto.stock}" value="1" onchange="validarCantidad(${producto.id})">
            <button onclick="agregarAlCarrito(${producto.id})" id="agregarBtn-${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>${producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}</button>
        `;
        productosDiv.appendChild(productoDiv);
    });
}

// Llamar a cargarProductos al cargar la ventana
window.addEventListener("load", () => {
    cargarProductos();
});

// Función para agregar un producto al carrito con una cierta cantidad
function agregarAlCarrito(id) {
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    const cantidad = parseInt(cantidadInput.value);
    const producto = productos.find(item => item.id === id);

    if (!producto) {
        Swal.fire('El producto no existe.', 'Verifica que cargaste', 'warning');
        return;
    }

    if (cantidad < 1) {
        Swal.fire('Oops','La cantidad debe ser mayor que 0.','warning');
        return;
    }

    // Verificar si la cantidad total excede el stock disponible
    const cantidadTotalEnCarrito = carrito.reduce((total, item) => {
        if (item.id === id) {
            return total + (item.cantidad + cantidad);
        }
        return total + item.cantidad;
    }, 0);

    if (cantidadTotalEnCarrito > producto.stock) {
        Swal.fire('Oops','La cantidad seleccionada excede el stock disponible.','warning');
        return;
    }

    // Verificar si el producto ya está en el carrito
    const productoEnCarritoIndex = carrito.findIndex(item => item.id === id);
    if (productoEnCarritoIndex !== -1) {
        carrito[productoEnCarritoIndex].cantidad += cantidad;
    } else {
        // Si el producto no está en el carrito, lo agregamos
        carrito.push({ ...producto, cantidad });
    }

    // Actualizar el estado de los botones de agregar al carrito
    mostrarProductos();

    // Mostrar los productos en el carrito
    mostrarCarrito();

    // Calcular y mostrar el valor total de la compra
    calcularTotalCompra();

    // Después de agregar el producto al carrito, llamamos a la función para actualizar la cantidad en el ícono del carrito
    actualizarCantidadCarrito();

    // Mostrar el popover al agregar un producto al carrito
    const popover = document.getElementById('popover');
    popover.style.display = 'block';

    // Ocultar el popover después de 3 segundos
    setTimeout(() => {
        popover.style.display = 'none';
    }, 3000);
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(index) {
    const cantidadRestar = carrito[index].cantidad;
    carrito.splice(index, 1); // Eliminar el producto del carrito

    // Volver a mostrar el carrito actualizado
    mostrarCarrito();

    // Actualizar el estado de los botones de agregar al carrito
    mostrarProductos();

    // Calcular y mostrar el valor total de la compra
    calcularTotalCompra();

    // Restar la cantidad eliminada del ícono del carrito
    actualizarCantidadCarrito();
}

// Función para actualizar la cantidad en el ícono del carrito
function actualizarCantidadCarrito() {
    // Obtener el elemento HTML donde se muestra la cantidad del carrito
    const cantidadCarritoSpan = document.getElementById("cantidadCarrito");

    // Calcular la cantidad total de productos en el carrito
    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);

    // Actualizar el contenido del elemento HTML con la nueva cantidad
    cantidadCarritoSpan.textContent = cantidadTotal.toString();
}


// Función para mostrar los productos en el carrito
function mostrarCarrito() {
    const carritoDiv = document.getElementById("carrito");
    carritoDiv.innerHTML = "";

    carrito.forEach((item, index) => {
        const carritoItem = document.createElement("div");
        carritoItem.classList.add("carrito-item");
        carritoItem.innerHTML = `
            <p>${item.nombre} - Cantidad: ${item.cantidad} - $${item.precio * item.cantidad}</p>
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        carritoDiv.appendChild(carritoItem);
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1); // Eliminar el producto del carrito
    mostrarCarrito(); // Volver a mostrar el carrito actualizado

    // Actualizar el estado de los botones de agregar al carrito
    mostrarProductos();

    // Calcular y mostrar el valor total de la compra
    calcularTotalCompra();

    // Después de eliminar el producto del carrito, llamamos a la función para actualizar la cantidad en el ícono del carrito
    actualizarCantidadCarrito();
}

// Función para validar la cantidad ingresada en el input
function validarCantidad(id) {
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    const cantidad = parseInt(cantidadInput.value);
    const agregarBtn = document.getElementById(`agregarBtn-${id}`);
    const producto = productos.find(item => item.id === id);

    if (cantidad > producto.stock || cantidad < 1) {
        agregarBtn.disabled = true;
    } else {
        agregarBtn.disabled = false;
    }
}

// Función para calcular el valor total de la compra
function calcularTotalCompra() {
    let totalCompra = 0;

    carrito.forEach(producto => {
        totalCompra += producto.precio * producto.cantidad;
    });

    // Mostrar el total de la compra
    const totalCompraSpan = document.getElementById("totalCompra");
    totalCompraSpan.textContent = `$${totalCompra.toFixed(2)}`;
}

// Función para comprar los productos en el carrito
function comprarProductos() {
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        Swal.fire('Oops !!','El carrito está vacío. Agrega productos antes de comprar.','warning');
        return; // Salir de la función si el carrito está vacío
    }

    // Calcular el valor total de la compra
    const totalCompra = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

    // Mostrar el total de la compra
    Swal.fire(`Total de la compra: $${totalCompra.toFixed(2)}`,'Gracias por la compra', 'success');

    // Lógica para procesar la compra
    carrito.forEach(producto => {
        // Restar la cantidad comprada del stock disponible del producto
        const productoIndex = productos.findIndex(item => item.id === producto.id);
        if (productoIndex !== -1) {
            productos[productoIndex].stock -= producto.cantidad;
        }
    });

    // Vaciar el carrito después de realizar la compra
    carrito = [];
    mostrarCarrito();

    // Actualizar el estado de los botones de agregar al carrito después de la compra
    mostrarProductos();

    // Restablecer el valor total de la compra a cero
    const totalCompraSpan = document.getElementById("totalCompra");
    totalCompraSpan.textContent = '$0.00';

    // Resetear la cantidad del carrito a cero
    const cantidadCarritoSpan = document.getElementById("cantidadCarrito");
    cantidadCarritoSpan.textContent = '0';
}

// Array para almacenar los productos en el carrito
let carrito = [];

// Mostrar los productos al cargar la página
window.addEventListener("load", () => {
    mostrarProductos();
});

// Función para mostrar la cantidad de elementos en el carrito
function mostrarCantidadCarrito() {
    const cantidadCarritoSpan = document.getElementById("cantidadCarrito");
    const cantidadCarrito = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    cantidadCarritoSpan.textContent = cantidadCarrito.toString();
}

// Llama a esta función cada vez que se actualice el carrito
mostrarCantidadCarrito();