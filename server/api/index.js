// server/api/index.js
import express from 'express';
//import { MongoClient } from 'mongodb';
import clientPromise from './mongoClient.js';
import cors from 'cors';
import { computeScore } from './scoreUtils.js';

const app = express();

app.use(cors());

/*
// Connexion MongoDB
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
});*/


// 🔓 Middleware pour débloquer complètement le CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // ← autorise toutes les origines
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send({ ack: true });
});

app.get('/deals/best', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('Lego2');

    const deals = await db.collection('deals').find({ source: 'dealabs' }).toArray();
    const sales = await db.collection('deals').find({ source: 'vinted' }).toArray();

    const scoredDeals = deals.map(deal => {
      const relatedSales = sales.filter(s => s.lego_id && s.lego_id === deal.lego_id);
      const score = computeScore(deal, relatedSales);
      return { ...deal, score };
    });

    scoredDeals.sort((a, b) => b.score - a.score);
    res.send({ results: scoredDeals });
  } catch (err) {
    console.error('❌ Error while computing best deals:', err);
    res.status(500).send({ error: 'Failed to compute best deals' });
  }
});

// ❗ VERCEL: Express app wrapper
export default function handler(req, res) {
  return app(req, res);
}
