import express from 'express';
import mysql2 from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());

app.use(cors());

// Configuración de la conexión a la base de datos
const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Reemplaza con tu contraseña
    database: 'tienda_online'  // Reemplaza con tu nombre de base de datos
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado a la base de datos de MySQL');
});

// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un producto
app.post('/productos', (req, res) => {
    const { code, description, price } = req.body;
    const sql = 'INSERT INTO productos (code, description, price) VALUES (?, ?, ?)';
    db.query(sql, [code, description, price], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});

// Ruta para eliminar un producto por código
app.delete('/productos/:code', (req, res) => {
    const { code } = req.params;
    const sql = 'DELETE FROM productos WHERE code = ?';
    db.query(sql, [code], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Producto eliminado', affectedRows: result.affectedRows });
    });
});

// Ruta para obtener los usuarios
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un usuario
app.post('/usuarios', (req, res) => {
    const { username, password, isAdmin } = req.body;
    const sql = 'INSERT INTO usuarios (username, password, isAdmin) VALUES (?, ?, ?)';
    db.query(sql, [username, password, isAdmin], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});

// Ruta para obtener todos los pedidos
app.get('/pedidos', (req, res) => {
    const sql = 'SELECT * FROM pedidos';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un pedido
app.post('/pedidos', (req, res) => {
    const { user_id, items, status, total, address, date } = req.body;
    const sql = 'INSERT INTO pedidos (user_id, items, status, total, address, date) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_id, items, status, total, address, date], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});

// Ruta para eliminar un pedido por id
app.delete('/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM pedidos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Pedido eliminado', affectedRows: result.affectedRows });
    });
});

// Ruta para actualizar un pedido por id
app.put('/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE pedidos SET status='Entregado' WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Pedido Entregado', affectedRows: result.affectedRows });
    });
});

// Ruta para obtener todos los pedidos entregados
app.get('/entregados', (req, res) => {
    const sql = 'SELECT * FROM entregados';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar un pedido entregado
app.post('/entregados', (req, res) => {
    const { user_id, items, status, total, address, date } = req.body;
    const sql = 'INSERT INTO entregados (user_id, items, status, total, address, date) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_id, items, status, total, address, date], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
