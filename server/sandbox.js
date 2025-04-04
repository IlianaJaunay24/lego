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



// ------------------ DEALABS ------------------ 

// const dealabs = require('./websites/dealabs');

async function sandboxDealabs(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  Browsing Dealabs: ${website}`);

    // const deals = await dealabs.scrape(website);
    // console.log(deals);

    console.log('✅ Dealabs scraping done');
  } catch (e) {
    console.error('❌ Dealabs error:', e);
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

  await sandboxDealabs();
  await goVinted();

  console.log("\n🏁 All scrapers finished!");
})();

