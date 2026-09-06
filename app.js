require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.log('❌ DB Error:', err));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// --- Database Schema ---
const ticketSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Open' }, // Open, Closed
    createdAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// --- Routes ---

// 1. Home Page - Customer Ticket Form
app.get('/', (req, res) => {
    res.render('index');
});

// 2. API - Submit New Ticket
app.post('/tickets', async (req, res) => {
    try {
        await Ticket.create(req.body);
        res.redirect('/thankyou');
    } catch (error) {
        res.status(500).send('Error creating ticket');
    }
});

// 3. Thank You Page
app.get('/thankyou', (req, res) => {
    res.send('<h1>🎉 Ticket Submitted Successfully!</h1><a href="/">Submit Another</a> | <a href="/admin">Admin Panel</a>');
});

// 4. Admin Dashboard - View all tickets
app.get('/admin', async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 }); // Newest first
        res.render('admin', { tickets });
    } catch (error) {
        res.status(500).send('Error loading admin panel');
    }
});

// 5. API - Update Ticket Status (Open to Closed)
app.put('/tickets/:id', async (req, res) => {
    try {
        await Ticket.findByIdAndUpdate(req.params.id, { status: 'Closed' });
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Error updating ticket');
    }
});

// 6. API - Delete Ticket
app.delete('/tickets/:id', async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Error deleting ticket');
    }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
