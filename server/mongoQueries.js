//import { getBestDiscountDeals, getMostCommentedDeals, ... } from './mongoQueries.js'; à utiliser pour importer quan je devrai trier sur ma page
import { MongoClient } from 'mongodb';
import readline from 'readline';

// 🔧 Configuration
const MONGODB_URI = 'mongodb+srv://ilianajaunay:onreteste@cluster0.khrt7c4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'Lego2';
const COLLECTION_NAME = 'deals';

//const client = new MongoClient(MONGODB_URI);
//let collection;

// 📦 Fonctions MongoDB

// 1. Find all best discount deals (only from dealabs)
async function getBestDiscountDeals(collection) {
    return await collection
      .find({ source: 'dealabs', discount: { $ne: null } })
      .sort({ discount: -1 })
      .limit(10)
      .toArray();
  }
  
  // 2. Find all most commented deals (commented out as you don’t have this field yet)
  
  async function getMostCommentedDeals(collection) {
    return await collection
      .find({ source: 'dealabs' })
      .sort({ comments: -1 })
      .limit(10)
      .toArray();
  }
  
  
  // 3. Find all deals sorted by price (only from dealabs)
  async function getDealsSortedByPrice(collection) {
    return await collection
      .find({ source: 'dealabs', price: { $ne: null, $gt: 0 } })
      .sort({ price: 1 })
      .limit(10)
      .toArray();
  }
  
  // 4. Find all deals sorted by date (only from dealabs)
  async function getDealsSortedByDate(collection) {
    return await collection
      .find({ source: 'dealabs' })
      .sort({ published: -1 })
      .limit(10)
      .toArray();
  }
  
  // 5. Find all sales for a given LEGO set id (only from vinted)
  async function getSalesForLegoId(collection, id) {
    return await collection
      .find({ source: 'vinted', lego_id: id })
      .toArray();
  }
  
  // 6. Find all sales scraped less than 3 weeks old (only from vinted)
  async function getSalesLessThan3WeeksOld(collection) {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  
    return await collection
      .find({
        source: 'vinted',
        published: { $gte: threeWeeksAgo }
      })
      .toArray();
  }
  
// 🎯 Interface CLI

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const prompt = (text) => new Promise(resolve => rl.question(text, resolve));
  
  async function main() {
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    try {
      await client.connect();
      const db = client.db(MONGODB_DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
  
      console.log('\n=== Quelle requête veux-tu exécuter ? ===');
      console.log('1 - Best discount deals');
      console.log('2 - Most commented deals'); // désactivé si tu n’as pas ce champ
      console.log('3 - Deals sorted by price');
      console.log('4 - Deals sorted by date');
      console.log('5 - Sales for a given Lego ID');
      console.log('6 - Sales scraped less than 3 weeks');
      const choice = await prompt('\nTon choix (1-6) : ');
  
      let results;
      switch (choice) {
        case '1':
          results = await getBestDiscountDeals(collection);
          break;
        case '2':
           results = await getMostCommentedDeals(collection);
           break;
        case '3':
          results = await getDealsSortedByPrice(collection);
          break;
        case '4':
          results = await getDealsSortedByDate(collection);
          break;
        case '5': {
          const id = await prompt('Quel ID LEGO ? ');
          results = await getSalesForLegoId(collection, id);
          break;
        }
        case '6':
          results = await getSalesLessThan3WeeksOld(collection);
          break;
        default:
          console.log('❌ Choix invalide.');
          rl.close();
          await client.close();
          return;
      }
  
      console.log(`\n✅ ${results.length} résultat(s) trouvé(s) :\n`);
      console.dir(results, { depth: null });
  
    } catch (err) {
      console.error('❌ Erreur MongoDB:', err);
    } finally {
      rl.close();
      await client.close();
    }
  }
  
  main();