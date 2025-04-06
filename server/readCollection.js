import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ijlego25:-h2D!R35sXY!yys@cluster0.sdtatbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

const client = await MongoClient.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = client.db(MONGODB_DB_NAME);
const collection = db.collection('deals');

// 🔍 Exemple de requêtes
//const totalCount = await collection.countDocuments();
//const vintedCount = await collection.countDocuments({ source: 'vinted' });
//const dealabsCount = await collection.countDocuments({ source: 'dealabs' });

//console.log(`📦 Total: ${totalCount}`);
//console.log(`🧩 Vinted: ${vintedCount}`);
//console.log(`🔥 Dealabs: ${dealabsCount}`);
console.log("ca marche");

await client.close();
