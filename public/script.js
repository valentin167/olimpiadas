// URL base de la API
const apiUrl = 'http://localhost:3000';

// Guardar datos en la base de datos a través del backend
const saveData = async (endpoint, data) => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error al guardar datos:', error);
    }
};

// Obtener datos de la base de datos a través del backend
const getData = async (endpoint) => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos:', error);
        return [];
    }
};

// Productos preestablecidos
const predefinedProducts = [
    { code: 'PROD001', description: 'Mancuernas', price: 29.99 },
    { code: 'PROD002', description: 'Barra', price: 39.99 },
    { code: 'PROD003', description: 'Discos', price: 39.99 },
    { code: 'PROD004', description: 'Soga', price: 4.99 },
    { code: 'PROD005', description: 'Colchoneta', price: 4.99 },
    { code: 'PROD006', description: 'Cama elastica', price: 59.99 },
    { code: 'PROD007', description: 'Banda elastica', price: 2.99 },
    { code: 'PROD008', description: 'Rodilleras', price: 3.99 },
    { code: 'PROD009', description: 'Straps', price: 3.99 },
    { code: 'PROD010', description: 'Musculosas', price: 9.99 }
];

// Inicialización de productos y usuarios
const initializeData = async () => {
    const products = await getData('/productos');
    const users = await getData('/usuarios');

    if (products.length === 0) {
        // Guardar productos predefinidos si la base de datos está vacía
        for (const product of predefinedProducts) {
            await saveData('/productos', product);
        }
    }

    if (users.length === 0) {
        const adminUser = { username: 'admin', password: 'admin123', isAdmin: true };
        await saveData('/usuarios', adminUser);
    }
};

// Mostrar/ocultar los enlaces de iniciar sesión y registro según el estado de sesión
const updateNav = () => {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutButton = document.getElementById('logout');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (loginLink && signupLink) {
        if (currentUser) {
            loginLink.style.display = 'none';
            signupLink.style.display = 'none';
        } else {
            loginLink.style.display = 'box';
            signupLink.style.display = 'box';
        }
    }

    if (logoutButton) {
        logoutButton.style.display = currentUser ? 'block' : 'none';
    }
};

// Cerrar sesión
const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('Has cerrado sesión exitosamente.');
    window.location.href = 'index.html';
};

// Actualizar el estado del botón de agregar al carrito
const updateAddToCartButtons = async () => {
    const buttons = document.querySelectorAll('button[data-action="add-to-cart"]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    buttons.forEach(button => {
        button.disabled = !currentUser; // Deshabilitar si no hay usuario actual
    });
};

// Cargar productos en la pantalla principal (index.html)
const loadProductsForUser = async () => {
    const products = await getData('/productos');
    const productList = document.getElementById('product-list');

    if (productList) {
        productList.innerHTML = products.map(product => `
            <div class="product">
                <div class="product-content">
                    <div class="product-txt">
                        <h2 class="card-title">${product.description}</h2>
                        <p class="card-text">$${product.price}</p>
                        <input type="number" id="quantity-${product.code}" min="1" value="1" class="form-control mb-2">
                    </div>
                    <div class="btn-1"> 
                    <a data-action="add-to-cart" class="btn-1" onclick="addToCart('${product.code}')">Agregar al Carrito</a>
                    </div>
                </div>
            </div>
        `).join('');
        updateAddToCartButtons(); // Actualizar el estado de los botones
    }
};

// Cargar productos en la pantalla de administración (admin.html)
const loadProductsForAdmin = async () => {
    const products = await getData('/productos');
    const productList = document.getElementById('product-list');

    if (productList) {
        productList.innerHTML = products.map(product => `
            <tr>
                <td>${product.code}</td>
                <td>${product.description}</td>
                <td>$${product.price}</td>
                <td><button class="btn btn-danger" onclick="removeProduct('${product.code}')">Eliminar</button></td>
            </tr>
        `).join('');
    }
};

// Manejo de agregar productos al carrito
const addToCart = async (code) => {
    const quantityInput = document.getElementById(`quantity-${code}`);
    const quantity = parseInt(quantityInput.value);
    const products = await getData('/productos');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = products.find(p => p.code === code);

    if (product) {
        const existingItemIndex = cart.findIndex(item => item.code === code);

        if (existingItemIndex > -1) {
            // Actualizar la cantidad si el producto ya está en el carrito
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Agregar un nuevo producto al carrito
            cart.push({ ...product, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Producto agregado al carrito.');
    } else {
        alert('Producto no encontrado.');
    }
};

// Manejo de formulario de registro
const handleSignup = async (event) => {
    event.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const users = await getData('/usuarios');

    if (users.find(user => user.username === username)) {
        alert('Usuario ya registrado.');
        return;
    }

    const response = await saveData('/usuarios', { username, password, isAdmin: false });
    if (response && response.id) {
        alert('Registro exitoso.');
        window.location.href = 'login.html';
    } else {
        alert('Error en el registro. Inténtalo de nuevo.');
    }
};

// Manejo de formulario de inicio de sesión
const handleLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = await getData('/usuarios');

    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Inicio de sesión exitoso.');
        window.location.href = 'index.html';
    } else {
        alert('Credenciales incorrectas.');
    }
};

// Manejo de formulario de carga de productos
const handleProductForm = async (event) => {
    event.preventDefault();
    const code = document.getElementById('product-code').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const products = await getData('/productos');

    const codeExists = products.some(product => product.code === code);
    if (codeExists) {
        alert('El código del producto ya existe. Por favor, utiliza un código diferente.');
    } else {
        await saveData('/productos', { code, description, price });
        loadProductsForAdmin();
    }
};

// Eliminar un producto
const removeProduct = async (code) => {
    try {
        await fetch(`${apiUrl}/productos/${code}`, {
            method: 'DELETE'
        });
        loadProductsForAdmin();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
    }
};

// Manejo de carrito de compras
const handleCart = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cart-items');
    const totalPriceElem = document.getElementById('total-price');

    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <li>
                ${item.description} - $${item.price}
                <input type="number" id="quantity-${item.code}" value="${item.quantity}" min="1" onchange="updateQuantity('${item.code}')">
                <button class="btn btn-danger" onclick="removeFromCart('${item.code}')">Eliminar</button>
            </li>
        `).join('');

        // Calcular el total de precio
        const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        totalPriceElem.textContent = totalPrice.toFixed(2);
    }
};

// Actualizar la cantidad de un producto en el carrito
const updateQuantity = (code) => {
    const quantityInput = document.getElementById(`quantity-${code}`);
    const newQuantity = parseInt(quantityInput.value);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.code === code);

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1); // Eliminar el producto si la cantidad es 0 o menor
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        handleCart(); // Actualizar la vista del carrito
    }
};

// Eliminar un producto del carrito
const removeFromCart = (code) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.code !== code);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    handleCart(); // Actualizar la vista del carrito
};

// Manejo de compra
const handleCheckout = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const address = document.getElementById('address').value.trim();
    if (!address) {
        alert('Por favor, ingresa una dirección para finalizar la compra.');
        return;
    }
    if (!currentUser) {
        alert('Debe iniciar sesión para realizar una compra.');
        return;
    }

    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    // Formatear los items del carrito
    const formattedItems = cart.map(item => `${item.description} x ${item.quantity}`).join(', ');
    const totalPrice = parseFloat(document.getElementById('total-price').textContent);
    const orderData = {
        user_id: currentUser.id,
        items: formattedItems,
        status: "Pendiente",
        total: totalPrice,
        address: address,
        date: new Date().toISOString()
    };

    try {
        const response = await saveData('/pedidos', orderData);
        if (response && response.id) {
            localStorage.removeItem('cart');
            alert('Compra registrada como pendiente.');
            window.location.href = 'cart.html';
        } else {
            throw new Error('No se pudo guardar el pedido');
        }
    } catch (error) {
        console.error('Error al guardar el pedido:', error);
        alert('Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.');
    }
};

// Cargar pedidos pendientes en la pantalla de administración (admin.html)
const loadPendingOrders = async () => {
    const orders = await getData('/pedidos');
    console.log(orders);
    const pendingOrdersList = document.getElementById('pending-orders-list');

    if (pendingOrdersList) {
        pendingOrdersList.innerHTML = orders
            .filter(order => order.status === 'Pendiente')
            .map(order => `
                <tr>
                    <td>${order.user_id}</td>
                    <td>${order.items}</td>
                    <td>$${order.total}</td>
                    <td>${order.address}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-success" onclick="deliverOrder('${order.id}')">Realizar entrega</button>
                        <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">Anular</button>
                    </td>
                </tr>
            `).join('');
    }
};

// Cargar pedidos pendientes en la pantalla de administración (admin.html)
const loadSentOrders = async () => {
    const orders = await getData('/pedidos');
    console.log(orders);
    const sentOrdersList = document.getElementById('sent-orders-list');

    if (sentOrdersList) {
        sentOrdersList.innerHTML = orders
            .filter(order => order.status === 'Entregado')
            .map(order => `
                <tr>
                    <td>${order.user_id}</td>
                    <td>$${order.total}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                </tr>
            `).join('');
    }
};


// Realizar entrega de un pedido
const deliverOrder = async (id) => {
    /*const orders = await getData('/pedidos');
    const order = orders.find(order => order.id === id);

    if (order) {
        order.status = 'Entregado';
        await saveData(`/pedidos/${id}`, order);
        loadPendingOrders();
    }*/
        try {
            await fetch(`${apiUrl}/pedidos/${id}`, {
                method: 'PUT'
            });
            loadPendingOrders();
        } catch (error) {
            console.error('Error al anular pedido:', error);
        }
	loadSentOrders();
};

// Anular un pedido
const cancelOrder = async (id) => {
    try {
        await fetch(`${apiUrl}/pedidos/${id}`, {
            method: 'DELETE'
        });
        loadPendingOrders();
    } catch (error) {
        console.error('Error al anular pedido:', error);
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await initializeData();
    updateNav();
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html') {
        loadProductsForUser();
    } else if (currentPage === 'admin.html') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser || !currentUser.isAdmin) {
            alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
            window.location.href = 'index.html'; // Redirigir a la página principal si no es admin
        } else {
            loadProductsForAdmin();
            loadPendingOrders();
	    loadSentOrders();
        }
    } else if (currentPage === 'login.html') {
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('toggle-password');

        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    } else if (document.getElementById('cart-items')) {
        handleCart();
    }

    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', handleSignup);

        const signupPasswordInput = document.getElementById('new-password');
        const toggleSignupPassword = document.getElementById('toggle-signup-password');

        toggleSignupPassword.addEventListener('click', () => {
            const type = signupPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            signupPasswordInput.setAttribute('type', type);
        });
    }
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    }

    if (document.getElementById('product-form')) {
        document.getElementById('product-form').addEventListener('submit', handleProductForm);
    }

    if (document.getElementById('checkout')) {
        document.getElementById('checkout').addEventListener('click', handleCheckout);
    }

    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});