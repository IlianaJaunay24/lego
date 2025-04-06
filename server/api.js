import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = 8092;

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

// 1) GET /deals/:id
app.get('/deals/:id', async (req, res) => {
  try {
    const deal = await db.collection('deals').findOne({ _id: new ObjectId(req.params.id) });
    if (!deal) return res.status(404).send({ error: 'Deal not found' });
    res.send(deal);
  } catch (e) {
    res.status(400).send({ error: 'Invalid ID format or DB error' });
  }
});

// 2) GET /deals/search
app.get('/deals/search', async (req, res) => {
  if (!db) return res.status(503).send({ error: 'Database not ready yet' });

  try {
    const limit = parseInt(req.query.limit) || 12;
    const price = parseFloat(req.query.price);
    const date = req.query.date;
    const filterBy = req.query.filterBy;

    const query = { source: 'dealabs' };

    if (!isNaN(price)) {
      query.price = { $lte: price };
    }

    if (date) {
      query.published = { $gte: new Date(date).toISOString() };
    }

    if (filterBy === 'best-discount') {
      query.discount = { $ne: null };
    } else if (filterBy === 'most-commented') {
      query.comments = { $ne: null };
    }

    const sort = filterBy === 'best-discount' ? { discount: -1 }
                : filterBy === 'most-commented' ? { comments: -1 }
                : { price: 1 };

    const results = await db.collection('deals')
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray();

    res.send({ results });
  } catch (e) {
    res.status(500).send({ error: 'Error while searching deals' });
  }
});

// 3) GET /sales/search
app.get('/sales/search', async (req, res) => {
  if (!db) return res.status(503).send({ error: 'Database not ready yet' });

  try {
    const limit = parseInt(req.query.limit) || 12;
    const legoSetId = req.query.legoSetId;

    const query = { source: 'vinted' };
    if (legoSetId) {
      query.title = { $regex: legoSetId };
    }

    const results = await db.collection('deals')
      .find(query)
      .sort({ published: -1 })
      .limit(limit)
      .toArray();

    res.send({ results });
  } catch (e) {
    res.status(500).send({ error: 'Error while searching sales' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
