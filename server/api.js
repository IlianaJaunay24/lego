/*const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

*/

import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = 8092;

// Connexion à MongoDB
const MONGODB_URI = 'mongodb+srv://ilianajaunay:onreteste@cluster0.khrt7c4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'Lego2';

let db;

MongoClient.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(client => {
  db = client.db(MONGODB_DB_NAME);
  console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// Routes
app.get('/', (req, res) => {
  res.send({ ack: true });
});

app.get('/deals/:id', async (req, res) => {
  try {
    const deal = await db.collection('deals').findOne({ _id: new ObjectId(req.params.id) });
    if (!deal) return res.status(404).send({ error: 'Deal not found' });
    res.send(deal);
  } catch (e) {
    res.status(400).send({ error: 'Invalid ID format or DB error' });
  }
});

app.get('/deals/search', async (req, res) => {
  if (!db) {
    return res.status(503).send({ error: 'Database not ready yet' });
  }

  try {
    const limit = parseInt(req.query.limit) || 12;
    const price = parseFloat(req.query.price);
    const date = req.query.date;
    const filterBy = req.query.filterBy;

    const query = {};

    if (!isNaN(price)) {
      query.price = { $lte: price }; // prix inférieur ou égal
    }

    if (date) {
      // Supposons que le champ s'appelle `date` et soit une string ISO
      query.date = date;
    }

    if (filterBy) {
      switch (filterBy) {
        case 'best-discount':
          // exemple fictif, tu dois adapter selon ton schéma MongoDB
          query.discount = { $exists: true };
          break;
        case 'most-commented':
          query.comments = { $exists: true };
          break;
        // Ajoute d'autres filtres ici si besoin
      }
    }

    const results = await db.collection('deals')
      .find(query)
      .sort({ price: 1 }) // tri croissant
      .limit(limit)
      .toArray();

    res.send({ results });
  } catch (e) {
    res.status(500).send({ error: 'Error while searching deals' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
