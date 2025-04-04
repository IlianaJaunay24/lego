const fetch = require('node-fetch');
const PQueue = require('p-queue').default;
const fs = require('fs');

// Liste en dur des LEGO IDs
const legoIDs = [
    '42182', '60363', '43231', '75403', '75404', '21034', '42635', '75405',
    '76266', '42176', '42635', '71460', '42202', '40524', '75402', '76262',
    '77051', '71387', '76303', '21333', '43224', '10363', '60373', '72032'
];

let SALES = {};

const queue = new PQueue({ concurrency: 1 });

/**
 * Fonction pour scrapper plusieurs IDs LEGO
 * @param {Array} ids - Liste des IDs LEGO
 */
async function getListingsByIds(ids) {
    console.log(`Start with ${ids.length} LEGO sets ...`);

    for (const id of ids) {
        queue.add(async () => {
            console.log(`🔎 Searching for LEGO ID: ${id}`);

            let results = await scrape(id);

            SALES[id] = results;
            console.log(`✅ Finished LEGO ID: ${id}, Found: ${results.length} listings`);

            await delay(5000); // Throttling de 5 secondes entre chaque requête
        });
    }

    await queue.onIdle();
    console.log(`📦 Total LEGO sets processed: ${Object.keys(SALES).length}`);
    fs.writeFileSync('vinted-for-client-v2.json', JSON.stringify(SALES, null, 2));
    console.log('✅ DONE!');
}

/**
 * Scraper pour un ID LEGO spécifique
 * @param {string} searchText - LEGO set ID
 * @returns {Array} - Liste des annonces
 */
const scrape = async (searchText) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000); // Générer un timestamp dynamique
        
        const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=${timestamp}&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&color_ids=&material_ids=`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.vinted.fr/',
                'Cookie': 'v_udt=UXkzWmFBQVVTY2Jpem92TkNTelZZTThqcFBoQi0teFpjNzN2V1hRVG9SZjIrSC0tZHBpc04ybG5wVkRPOW45bjM3b0hoQT09; anonymous-locale=fr; anon_id=90efd5db-b8a5-4917-acad-740ff88cbc33; ab.optOut=This-cookie-will-expire-in-2026; OptanonAlertBoxClosed=2025-01-06T14:49:33.495Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjE0NjcyLCJzaWQiOiI3Y2U1MzM3Mi0xNzQxNjE0NjcyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MjE4NzIsInB1cnBvc2UiOiJhY2Nlc3MifQ.Ij5F9EwPCydIWT7A7YFQK4tNqo2_UShiUQbf8PsFz6iPT0HUlCPGqmSjV3H60l8FUB2xQQUjKeLPTxXXBdB4XciLNKgZDnee3ywW0ygs5ijBBPQ6QIQCh97rbMxGSn2CMaq3JjqnL-4nxqObZgi_nrcfbWhPKHmHSRAbDy8izotCM0kzXgkASSLTVolKXbkppmE6qPY3zcXE-GSAGB3mSCkjR8ykp-TaHqbbr9EdOCxLupOfR5hw_J8Ao-krzkPJe7WhfzS1cwWF3W9Hazlsd7EnqdDTbySE1XXbDVrP6W3KCRii1piKPYBjHEJqkKHHzmgiwqVwQRsjSW3dXbsp3Q; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjE0NjcyLCJzaWQiOiI3Y2U1MzM3Mi0xNzQxNjE0NjcyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMTk0NzIsInB1cnBvc2UiOiJyZWZyZXNoIn0.GigKeTPiFPW36gbCguKXJWSu_1_E1Hha6ED1KtRejmSRqjpsuB5laYxdjSwcMQt4tc6qXc_oF4D2T4PKv1l-xgnsHRdmSilAiCbGiVkfp1s23wEMJdxRy_zPandjs0qzQZEkI1_bonWKodt1k9f79ft_0OAsQ5oWyrjrKS0UQyrkg1oXUAtVX8pl6Ley-cmXuKio3JaQ_QvNTRagTnNwt83HQmpZDyHPS_8Kcpr7WczeUbGJtxa5dwAKMux47KEWdhTRVJuC1pSOt0diMXzhMN_C_kxIrfnPZdSecj90Zg9kW2XvK7Q6zTFMQ9IA8HXrUjuDhwSwcYcAHA_iCmY8Rg; v_sid=a92559aead5ffeb356e3ce1c2e0744ab; __cf_bm=0.ZRC_BWKCArmIQdclHBxLIxL3nIapXxCZwJ8h6TiwI-1741618976-1.0.1.1-mJMkZrx5YeSrw3G9eYBxnlm7Mgc5Nh8rsR9dIQ_1rO1PNHd.mcvPzX31qBk1P5l_AKFaF5tlfCDAoRRrVWraCsWg08O1m_DjfUm1DNEyp6EFXmbB8Z1194_JBMyr01Ib; cf_clearance=FdsotC3QipxDbj05MIaH8UD8YQxp56Ij4_ZGDf9tfas-1741618976-1.2.1.1-_u4F9E4CpIsqd3bWPtC_zL0wpFYvsIma4hGsY7Jse0TXGyNWN0UY1PqpeTYoUPWdpKfwEx_nn4gEbyWroA2sYRMNR42L0GzJuKUlDJE5.UpQkIWSfbrW4lLSrpJlIu.7cyzc51GO1j4SuQGJ.oYhc1JMl01mp3yFfLir6OprI9uL.k1pd9Sa.Rf.EFXgkS7cTMP8goZiqk4gOUO5cSdEFrg9yNYNqAkTYKUtPQlZi4aYVcoUl5bl5_tNE.apkt8KeXr_TFz9QSagDCY_O0Qyb1UKsn_bBJ.UMEXH4P_uu5UArvy7abSKz6PGdH2tU8XeH7AI1EZFCUEc_hJf7icLum_4QEi8WhkYeePFv16JdWH6juUs4_QNSpZ0Chdv3x_LvfhbUxeYHrRkqjYF5Cz7U7do8teOGyNZOsUliFbE3TQ; viewport_size=568; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+10+2025+16%3A03%3A18+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=90efd5db-b8a5-4917-acad-740ff88cbc33&interactionCount=19&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; datadome=j9KiFhZLDKoRtEgUEw2OtLjk12az63xBByfc_OZSEzjEy8WHclsfcU_9bAkC4C20Euht8DVT9qlqdR9yqTrjcKpxC7m~rQj~l3DKzvu2p~Zh~1JRwGnvx_rZD0xgeUbb; _vinted_fr_session=eGlTeXdodmRzK2RLNzFGNzIzbmxoandJSkhiSXlIdkk0T1M5OElwdVVaY3JhQm5rQ05TaFVDVitFU200VDNKK1EyUUJocHhvVzQwU2FRcnd0K0w5K2RBS0pFeDJ4SWhFTnpLYW5pVUVaTVdoWG5NaEVKODNiNFNUa1VCb0VvNWY0azQyNUM2RjgwNUVxb0o4UVA1WUVPZG15QzBmZGVaRStKMEpSZ1dsYTUrR3pNeUZNRkh3NjhkMUQ4QkF1VEx5Witmc1NDMzVKQU9iYjZhbnpSbFMvZ2E3cFZYYWxBR1hFMkcwdWhtWjVVVDhVOE5uQTh2K2lnbXh6YmVoRUJEYi0tNWtRTlNVNW9QL0JXN0hEYnZPcHRIdz09--45235862056621d50e1e2c11158aebc5024f5e7b; banners_ui_state=PENDING'
            }
        });

        const data = await response.json();
        const items = data.items || []; // Retourne les éléments de la réponse ou un tableau vide si aucun élément

        // Extraire les détails spécifiques
        const results = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                price: item.price.amount,
                currency: item.price.currency_code,
                url: item.url,
                brand: item.brand_title,
                imageUrl: item.photo.full_size_url,
                status: item.status,
                user: {
                    login: item.user.login,
                    profileUrl: item.user.profile_url
                },
                serviceFee: item.service_fee.amount,
                totalPrice: item.total_item_price.amount,
                size: item.size_title,
                favoriteCount: item.favourite_count
            };
        });

        return results;
    } catch (error) {
        console.error(`❌ Error while scraping LEGO ID ${searchText}:`, error);
        return [];
    }
}

/**
 * Fonction pour ajouter un délai entre les requêtes
 * @param {number} ms - Délai en millisecondes
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));



module.exports = { getListingsByIds }; // Assurez-vous que cette ligne existe et est correcte

