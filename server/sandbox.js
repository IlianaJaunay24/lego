/* eslint-disable no-console, no-process-exit */
/*const avenuedelabrique = require('./websites/avenuedelabrique');

async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}*/

/*
const dealabs = require('./websites/dealabs');

async function sandbox(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
    try {
        console.log(`🕵️‍♀️  browsing ${website} website`);

        const deals = await dealabs.scrape(website);

        console.log(deals);
        console.log('done');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

const [,, eshop] = process.argv;

sandbox(eshop);*/
/*

// Liste en dur des LEGO IDs
const legoIDs = [
  '42182', '60363', '43231', '75403', '75404', '21034', '42635', '75405',
  '76266', '42176', '42635', '71460', '42202', '40524', '75402', '76262',
  '77051', '71387', '76303', '21333', '43224', '10363', '60373', '72032'
];


const vinted = require('./websites/vinted'); // Import du module Vinted

async function sandbox(legoIDs = []) {
    try {
        console.log(`🕵️‍♀️  Scraping des annonces pour les LEGO IDs suivants: ${legoIDs.join(', ')}`);

        // Appel de getListingsByIds pour scrapper les annonces
        const deals = await vinted.getListingsByIds(legoIDs);
        console.log(deals);
        console.log('✅ Scraping terminé');
        process.exit(0);
    } catch (e) {
        console.error('❌ Erreur:', e);
        process.exit(1);
    }
}

// Récupérer la liste d'IDs LEGO depuis les arguments de la ligne de commande

sandbox(legoIDs);*/


/*

import * as dealabs from './websites/dealabs.js';
import * as vinted from './websites/vinted.js';
import * as avenueDeLaBrique from './websites/avenuedelabrique.js';

import * as fs from 'fs';
import Queue from 'p-queue';
import delay from 'delay';


//const vinted = require('./websites/vinted');
//const SCRAPPED_DEALS = JSON.parse(fs.readFileSync('dealabsDeals.json', 'utf8'));


const queue = new Queue({ concurrency: 1 });
const LEGO_SET_IDS = [
  '42182', '60363', '43231', '75403',
  '75404', '21034', '42635',
  '75405', '76266', '42176', '42635',
  '71460', '42202', '40524',
  '75402', '76262', '77051', '71387',
  '76303', '21333', '43224', '10363',
  '60373', '72032', '75332', '76959',
  '76969', '40460'
];
let SALES = {};

async function goVinted() {
  console.log(`Start with ${LEGO_SET_IDS.length} lego sets ...`);

  for (const id of LEGO_SET_IDS) {
    queue.add(async () => {
      console.log(`browsing ${id} website`);
      let results = await vinted.scrape(id);

      if (results) {
        SALES[id] = results;
        console.log(`Results for ${id}:`, results);
      } else {
        console.error(`No results for ${id}`);
      }

      console.log("waiting...");
      await delay(5000);
    });
  }

  await queue.onIdle();
  console.log(`Total sales found: ${Object.keys(SALES).length}`);
  fs.writeFileSync('vinted-for-client-v2.json', JSON.stringify(SALES, null, 2));
  console.log('done');
  console.log(SALES); // Affiche les résultats
}

goVinted();*/

/*

// ------------------ DEALABS ------------------ 

import dealabs from './websites/dealabs.js';

async function sandboxDealabs(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  Browsing Dealabs: ${website}`);

    const deals = await dealabs.scrape(website);
    console.log(deals);

    console.log('✅ Dealabs scraping done');
    process.exit(0);

  } catch (e) {
    console.error('❌ Dealabs error:', e);
    process.exit(1);
  }
}

// ------------------ VINTED ------------------ 

import * as vinted from './websites/vinted.js';
import * as fs from 'fs';
import Queue from 'p-queue';
import delay from 'delay';

const queue = new Queue({ concurrency: 1 });

const LEGO_SET_IDS = [
  '42182', '60363', '43231', '75403', '75404', '21034', '42635',
  '75405', '76266', '42176', '71460', '42202', '40524',
  '75402', '76262', '77051', '71387', '76303', '21333',
  '43224', '10363', '60373', '72032', '75332', '76959',
  '76969', '40460'
];

let SALES = {};

async function goVinted() {
  console.log(`🧩 Starting Vinted scraping for ${LEGO_SET_IDS.length} sets...`);

  for (const id of LEGO_SET_IDS) {
    await queue.add(async () => {
      console.log(`🔍 Scraping Vinted for: ${id}`);
      const results = await vinted.scrape(id);

      if (results) {
        SALES[id] = results;
        console.log(`✅ Results for ${id}:`, results);
      } else {
        console.error(`⚠️ No results for ${id}`);
      }

      console.log("⏳ Waiting...");
      await delay(5000);
    });
  }

  await queue.onIdle();
  fs.writeFileSync('vinted-for-client-v2.json', JSON.stringify(SALES, null, 2));
  console.log('✅ Vinted scraping done');
}

// ------------------ MAIN ------------------ 

(async () => {
  console.log("🚀 Starting all scrapers...\n");
  const [,, eshop] = process.argv;

  sandboxDealabs(eshop);
  
  await goVinted();

  console.log("\n🏁 All scrapers finished!");
})();



//MongoDB

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ijlego25:-h2D!R35sXY!yys@cluster0.sdtatbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

const client = await MongoClient.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = client.db(MONGODB_DB_NAME);


const collection = db.collection('deals');
const result = await collection.insertMany(deals);

console.log('Inserted:', result.insertedCount);

await client.close();

*/

import * as dealabs from './websites/dealabs.js';
import * as vinted from './websites/vinted.js';
import * as fs from 'fs';
import Queue from 'p-queue';
import delay from 'delay';
import { MongoClient } from 'mongodb';

const queue = new Queue({ concurrency: 1 });
/*
const LEGO_SET_IDS = [
  '42182', '60363', '43231', '75403', '75404', '21034', '42635',
  '75405', '76266', '42176', '71460', '42202', '40524',
  '75402', '76262', '77051', '71387', '76303', '21333',
  '43224', '10363', '60373', '72032', '75332', '76959',
  '76969', '40460'
];*/


// ------------------ GLOBAL DEALS ------------------

let dealabsDeals = [];
let vintedDeals = [];

// ------------------ DEALABS ------------------

async function sandboxDealabs(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  Browsing Dealabs: ${website}`);

    dealabsDeals = await dealabs.scrape(website);
    console.log(dealabsDeals);

    console.log('✅ Dealabs scraping done');
  } catch (e) {
    console.error('❌ Dealabs error:', e);
  }
}


// ------------------ VINTED ------------------

async function goVinted(LEGO_SET_IDS){//,retailById) {
  console.log(`🧩 Starting Vinted scraping for ${LEGO_SET_IDS.length} sets...`);

  for (const id of LEGO_SET_IDS) {
    await queue.add(async () => {
      console.log(`🔍 Scraping Vinted for: ${id}`);
      const results = await vinted.scrape(id);

      if (results) {
          const enriched = results.map(item => {
          //const idMatch = item.title.match(/\b\d{5}\b/);
          //const id = idMatch ? idMatch[0] : null;
          const id_lego = id;
          //const retail = id ? retailById[id] : null;
          //const discount = retail ? Math.round((retail - item.price) / retail * 100) : null;
        
          return {
            ...item,
            lego_id: id_lego//,
            //retail: retail || null,
            //discount: discount || null
          };
        });
        
        vintedDeals.push(...enriched);  
        console.log(`✅ Results for ${id}:`, enriched.length,enriched);   
        /*vintedDeals.push(...results);  
        console.log(`✅ Results for ${id}:`, results.length,results);*/
      } else {
        console.error(`⚠️ No results for ${id}`);
      }

      console.log("⏳ Waiting...");
      await delay(5000);
    });
  }

  await queue.onIdle();
  fs.writeFileSync('vinted-for-client-v2.json', JSON.stringify(vintedDeals, null, 2));
  console.log('✅ Vinted scraping done');
}


// ------------------ MAIN ------------------

(async () => {
  console.log("🚀 Starting all scrapers...\n");

  const [,, eshop] = process.argv;

  await sandboxDealabs(eshop); // Ajout du "await" ici
  
  // 2. Extraire dynamiquement les IDs LEGO + retail par ID
  const extractLegoIds = (deals) => {
    const regex = /\b\d{5}\b/g;
    const ids = new Set();
  
    for (const deal of deals) {
      const matches = deal.title.match(regex);
      if (matches) {
        const id = matches[0]; // on prend le premier match
        ids.add(id);
  
        // Associer l'id directement dans l'objet deal
        deal.lego_id = id;
  
      } else {
        // Aucun match => lego_id à null
        deal.lego_id = null;
      }
    }
  
    return ids;
  };


  const LEGO_SET_IDS = extractLegoIds(dealabsDeals);
  console.log(`🧩 Extracted ${LEGO_SET_IDS.length} LEGO IDs\n`, LEGO_SET_IDS);


  await goVinted(LEGO_SET_IDS);

  // 👉 Fusionner les deux sources
  const allDeals = [
    ...dealabsDeals.map(d => ({ ...d, source: 'dealabs' })),
    ...vintedDeals.map(d => ({ ...d, source: 'vinted' }))
  ];

  // ------------------ MongoDB ------------------

  
  //const MONGODB_URI = 'mongodb+srv://ijlego25:-h2D!R35sXY!yys@cluster0.sdtatbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const MONGODB_URI = 'mongodb+srv://ilianajaunay:onreteste@cluster0.khrt7c4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const MONGODB_DB_NAME = 'Lego2';

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db(MONGODB_DB_NAME);

  const collection = db.collection('deals');

  // Supprimer les anciens deals
  await collection.deleteMany({ source: 'dealabs' });
  await collection.deleteMany({ source: 'vinted' });

  const result = await collection.insertMany(allDeals);

  console.log('✅ Inserted:', result.insertedCount);

  // 🔍 Exemple de requêtes
  const totalCount = await collection.countDocuments();
  const vintedCount = await collection.countDocuments({ source: 'vinted' });
  const dealabsCount = await collection.countDocuments({ source: 'dealabs' });
  
  console.log(`📦 Total: ${totalCount}`);
  console.log(`🧩 Vinted: ${vintedCount}`);
  console.log(`🔥 Dealabs: ${dealabsCount}`);

  await client.close();

  console.log("\n🏁 All scrapers + DB insert finished!");
})();


