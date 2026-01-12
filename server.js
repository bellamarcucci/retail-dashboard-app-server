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

// Helper to read data
const readData = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET Products
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

// POST Purchase (Checkout)
app.post('/api/purchase', (req, res) => {
    const { cart } = req.body; // Expects array of IDs and quantities
    let products = readData();
    let success = true;

    // Check stock first
    cart.forEach(item => {
        const product = products.find(p => p.id == item.id);
        if (!product || product.stock < item.quantity) {
            success = false;
        }
    });

    if (success) {
        cart.forEach(item => {
            const index = products.findIndex(p => p.id == item.id);
            products[index].stock -= item.quantity;
        });
        writeData(products);
        res.json({ success: true, message: 'Purchase successful' });
    } else {
        res.status(400).json({ success: false, message: 'Not enough stock' });
    }
});

// POST Admin Stock Update
app.post('/api/admin/stock', (req, res) => {
    const { id, quantity } = req.body;
    let products = readData();
    const index = products.findIndex(p => p.id == id);
    
    if (index !== -1) {
        products[index].stock += Number(quantity);
        writeData(products);
        res.json({ success: true });
    } else {
        res.status(404).send('Product not found');
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
        productSalesPotential: [] // In a real app this would be actual sales history
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
