require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MSSQL Connection Config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Required for Azure SQL
        enableArithAbort: true
    }
};

console.log("DB_SERVER:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "******" : "Not Set");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);


// Connect to Database
sql.connect(dbConfig)
    .then((pool) => {
        console.log("✅ Connected to Azure SQL Database");
        global.dbPool = pool; // Store the connection pool globally
    })
    .catch(err => console.error("❌ Database Connection Failed:", err));

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig); // Ensure connection
        const result = await pool.request().query("SELECT 1"); // Use connection pool
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error("DB Connection error:", err.message);
        res.status(500).json({ error: "Database connection failed", details: err.message });
    }
});
    


app.get("/test-db", async (req, res) => {
        try {
            await db.query("SELECT 1");
            res.json({ success: true, message: "DB Connection successful" });
        } catch (err) {
            console.error("DB Connection error:", err.message);
            res.status(500).json({ error: "Database connection failed" });
        }
    });
    

// Default Route
app.get('/', (req, res) => {
    res.send('Product Management API is running...');
});

app.get('/products', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM products");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching products:", err.message);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});


app.post('/order', async (req, res) => {
    const { productId, orderQuantity } = req.body;
    
    if (!productId || !orderQuantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Check available stock
        const checkStock = await pool.request()
            .input('id', sql.Int, productId)
            .query("SELECT quantity FROM products WHERE id = @id");
        
        if (checkStock.recordset.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const availableQuantity = checkStock.recordset[0].quantity;

        if (availableQuantity < orderQuantity) {
            return res.status(400).json({ error: "Not enough stock available" });
        }

        // Update quantity
        await pool.request()
            .input('id', sql.Int, productId)
            .input('newQuantity', sql.Int, availableQuantity - orderQuantity)
            .query("UPDATE products SET quantity = @newQuantity WHERE id = @id");

        res.json({ message: "Order placed successfully" });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ error: "Failed to place order" });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
