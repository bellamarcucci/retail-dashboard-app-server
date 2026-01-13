const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

app.use(cors());
app.use(bodyParser.json());

// Functions

// 1. Function to READ data from the JSON file
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler o arquivo JSON:", error);
        return [];
    }
};

// 2. Function to save data to the JSON file 
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log("Dados salvos com sucesso no products.json");
    } catch (error) {
        console.error("Erro ao salvar no arquivo JSON:", error);
    }
};

// API Endpoints

// GET products
app.get('/api/products', (req, res) => {
    const products = readData();
    res.json(products);
});

// GET Single Product
app.get('/api/products/:id', (req, res) => {
    const products = readData();
    const product = products.find(p => p.id == req.params.id);
    if (product) res.json(product);
    else res.status(404).send('Product not found');
});

// POST Review
app.post('/api/review/:id', (req, res) => {
    const { rating, comment } = req.body;
    const products = readData();
    const index = products.findIndex(p => p.id == req.params.id);
    
    if (index !== -1) {
        products[index].reviews.push({ rating: Number(rating), comment });
        writeData(products);
        res.json({ message: 'Review added', product: products[index] });
    } else {
        res.status(404).send('Product not found');
    }
});


// POST: Checkout
app.post('/api/purchase', (req, res) => {
    const { cart } = req.body;
    let products = readData(); // Lê o arquivo atual
    let success = true;

    // Check stock
    cart.forEach(item => {
        const product = products.find(p => p.id == item.id);
        if (!product || product.stock < item.quantity) {
            success = false;
        }
    });

    if (success) {
        // Update stock
        cart.forEach(item => {
            const index = products.findIndex(p => p.id == item.id);
            if (index !== -1) {
                products[index].stock -= item.quantity;
            }
        });

        // Save updated stock to file
        writeData(products); 
        
        res.json({ success: true, message: 'Compra realizada!' });
    } else {
        res.status(400).json({ success: false, message: 'Estoque insuficiente.' });
    }
});

// POST: Update stock (Admin) 
app.post('/api/admin/stock', (req, res) => {
    const { id, quantity } = req.body;
    let products = readData();
    
    const index = products.findIndex(p => p.id == id);
    
    if (index !== -1) {
        products[index].stock += Number(quantity); 
        writeData(products);

        res.json({ success: true, newStock: products[index].stock });
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

// GET Dashboard Data (Regex Analysis)
app.get('/api/admin/dashboard', (req, res) => {
    const products = readData();
    
    // Keyword Analysis
    const keywords = {
        positive: /great|good|excellent|amazing|love/i,
        negative: /bad|poor|broken|disappoint|hate/i
    };

    let stats = {
        totalStock: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        productSalesPotential: []
    };

    products.forEach(p => {
        stats.totalStock += p.stock;
        
        p.reviews.forEach(r => {
            if (keywords.positive.test(r.comment)) stats.positiveReviews++;
            if (keywords.negative.test(r.comment)) stats.negativeReviews++;
        });

        // Calculate average rating
        const avgRating = p.reviews.length 
            ? p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length 
            : 0;

        stats.productSalesPotential.push({
            name: p.name,
            stock: p.stock,
            rating: avgRating
        });
    });

    res.json(stats);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});