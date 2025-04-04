import { v5 as uuidv5 } from 'uuid';

//const { title } = require("process");

const parse = data => {
    try {
      const { items } = data;
  
      return items.map(item => {
        const link = item.url;
        const price = item.total_item_price;
        const { photo } = item;
        const published = photo.high_resolution && photo.high_resolution.timestamp;
  
        return {
          link,
          'price': price.amount,
          title: item.title,
          'published': (new Date(published * 1000)).toUTCString(),
          'uuid': uuidv5(link, uuidv5.URL)
        };
      });
    } catch (error) {
      console.error('Error parsing data:', error);
      return [];
    }
  };
  
  const scrape = async searchText => {
    try {
      const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1741630196&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=`, {
        /*credentials: 'include',
        method: 'GET',
        mode: 'cors',*/
        headers: {
          //"accept": "application/json, text/plain, */*",
          /*"accept-language": "fr",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
          "sec-ch-ua-arch": "\"x86\"",
          "sec-ch-ua-bitness": "\"64\"",
          "sec-ch-ua-full-version": "\"129.0.6668.59\"",
          "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"129.0.6668.59\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.59\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": "\"\"",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-ch-ua-platform-version": "\"19.0.0\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "x-anon-id": "98bb9607-00c4-4fc4-a3af-62b0b17ed510",
          "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
          "x-money-object": "true",*/
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.vinted.fr/',
          "cookie": "v_udt=UXkzWmFBQVVTY2Jpem92TkNTelZZTThqcFBoQi0teFpjNzN2V1hRVG9SZjIrSC0tZHBpc04ybG5wVkRPOW45bjM3b0hoQT09; anonymous-locale=fr; anon_id=90efd5db-b8a5-4917-acad-740ff88cbc33; ab.optOut=This-cookie-will-expire-in-2026; OptanonAlertBoxClosed=2025-01-06T14:49:33.495Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; __cf_bm=IalCvhitVA.KKTRf2V46PeTL68rMJH_QQJDx15hM4H8-1743783972-1.0.1.1-9wf37GrPK3AMYZAmaJajyPkXWNrTD89BuH8zLL8dPmofK7SgcsnW9ry0SWGWnwC25T18_3cxqb_3FQualoy6pKtKqGBEYoYYMQDDZUQ4O04SRD.VeODKO8MKhmTIpc2e; cf_clearance=eDsrd1v5TBstv7uOVH3fXoNFlf0MO2tGrV1iHaatQjo-1743783981-1.2.1.1-BPoXUHoJryhoR9oms3c4HJmV1rxG795hdgHnTzygNDJcY9eVIssAwnhvf_Ag27C5hKn.SiZ8FOk..np.2WuHJHKDACWvz.XCYHEr7pbRd5nlQXIozXSIF2d1l.PO2T_1lxzneO8Qr8XtbdEFFjKqsZho_toRijE6NTnZ07taduPCfqCs7mtx8gU3DVPbEdMgr.4xRkLJBghB32ntAsah4lofyBvCWjh8tdApERheZT2wL3dVDP4Jwvdc4nyqnjtUjgILkg_FXABuDMFNymkKS.qiIhQ30L47ZrfeNxcXtMTy_do5LyD6GuA5MGuKCKRijWeRBX1XvAIFCtgaBE_q6DRJ2VDnJ.OLzXYyYPFemrE; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNzgzOTgyLCJzaWQiOiI0ODUxNzhiMC0xNzQzNzc0NzAyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM3OTExODIsInB1cnBvc2UiOiJhY2Nlc3MifQ.qOJwsjR5crVp7dg8irAiT3t9iepufje8je4imqcLOmUvKUOe-tX3aaMXldrugQ3JDjaWMZJjUmoZSChmbfUOHIUQ_Poi2vVgT0rAu2YLFrn5_W95KTe7cdAE6iUKWmAhMusWJMP_8MmFXSpz-OddNSLghuaxiL4oa2G3bATXDOt0isAfeyZnnOWnpEe7OWANWy8fJZ0cvWeVT-yxUnPd8KQl9VJL4uXvvB9kyZLFu9BYa7TiBk7zHrQx72CbtwoEfs8Y8DWL_gPHOAEQ1pU6Jcz0uNQmydcKV93kjiANDYqyesTt4w7Kz0wAr-kZ0MjQ_3av8_CZB5nbxokPYs8pXA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNzgzOTgyLCJzaWQiOiI0ODUxNzhiMC0xNzQzNzc0NzAyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQzODg3ODIsInB1cnBvc2UiOiJyZWZyZXNoIn0.R3AYcl7NU5z8q4r4jWV55Po-w_AavFj11czvzVQUjLH5hyF2OvYri-NjIQ_Y6nU0-Eo5LiD5hKGEostx8CLjM73aJg1UCw2SO0jszW9n4L3RWHkAHXjyHC8XKkOQ5PFSZbU4fgcTOrt7KKMts1s_FLXNv9uH5E2ryky-oD-kdmCbU9SOhjnF8itUJXUuNUFS0hrjeOzTAbI5zNUG1zQoBj5ZcOgODQ2Nr1WPbCOYSx-bd4IoDB0nMs_6o2JHNOkbHnYenZJUOrEiqSKO27koPYX8Zu47GtDALqMWrDd9mtT98eq4KhqSsgdaybMEo32Ret-D-Iwjl42NBxtlR_I0aA; v_sid=485178b0-1743774702; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Apr+04+2025+18%3A26%3A33+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=90efd5db-b8a5-4917-acad-740ff88cbc33&interactionCount=32&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; banners_ui_state=SUCCESS; _vinted_fr_session=WVhlN1BldGxEdEo5SzFWQ0kyQ2Q3aXRSSXhGdnZDbUFNcy9vVHFQM0JLeWVMaUlzMVhjM2xVVHZ5bSsyTysrWFc3dDV4UE9zdlhZWWtSbVFSSUVHZHAyU2gwMmhlcG1ock13NWY3S3dFL1hUQW9wTWUzeUVuNG9VK1pjZVdBaTlWRTFrMERaeXZ5aDNXNGJYRVdTWllOQjNDVVU1VGV1NzJuMUxQMVJkRXNjc0laSHQ0bitYMHl0R250VzJOdUlGKzMrTWRDMERYNCtHdkVzUTdVTHR3NXlYNzZ4Z2JWTTRPM256V2V3VktIYytoWldybXVTWUVVSGpvekNjNmdhSElJZEFrRGtjZEpnRlZnaURlVStIb1JEU3k5L041LzNTcnlWdnJjVjBGcURKOVRqUEp5OXRGbVQrN1dVc24xOW5xaVdKdXR1NzZNZnkxOHJkRTk3dmt1MnlxTzVJTUF0a21nNUNsTDJaY0lxNHZwaVZ1aVJNZzRsWjdNbGFzUTRtZnhMMjJMQUJWTGpzeitXa3hrMEt6S2YwY3Y5UExFV0cwaXQ0RHk0Vkx2MHE3cjZVdTRxMGw5ZDk2NlUvdnFlVEsyNjJDYlJHRGlCcUx0bkY0RUUzeEgxbnFrbThYRzZWUkVuYStHOXFHMmhCcnZVSXRNQ2hyaUdRRHE5RE9jUm13R25ta051V3V2RGF4eTFHcmVuWGMySnRLNjltSjQ0RnNDVVhLYnMvQXRURUlqVkI4OHVRY0RRQ0FMaGlsbUxndzBDRGJySXNnSGdxckxmS2NXQXM3Q1g1TlV2ZUVGRGdGcmkxRDZQcW1GdlhiNVY0M3RBaWF0MFNKeEJzN2E2bU9FQ2RnZU5MeVQzcHNETHR2T2dCRjBycVhmWFpvM3FmV1dJU0N6Umw2RURHTEU4eCtXbFJyNDhIZkQvbFhqS05FcDhkNmp1Sm1nekNycGphMGtTRUZaVkNrZFlWV1pGUjZvNk4zeG40VXJWOXlxVHJIOVoyTy8zRE9JT1NMSTQvSEdaZitpcklVS25DUFRScWpyRVRzRDJJaUdweVVpdHhZTEpaRFlMR05iSmxMN1BnM1Y4L3lkSUhaNjdwWFh1a0Y3aVlzb3hBQzFEUHhZRTZ4YndMMHdkM2JPcHAycXdmbkZ4UnMya0hSYnppQStjU0xuaVBZaGRGZ3RYeTZhOE82aExmNitiRmE5K2haUVFrWE5oWFNqTUxmU2h3d1hUSHRldjY2NDFNbDNCZ0hGb0JqNmk2Q2s0dk04L0w2Q2tiOHhiV0gyOWZhb29QVllCbXpidDZZTHZFZ2VIQkY2S2lMTGtGL05tNjMxTUhnMVIxbWdYRHI0VmxLbHByNFplQTY5RXp2N2NiTHoxM1Q1WjZSb294cCtUL2RIN2pqNUdNNXlYMFdFRzg1eVh6QytQSE9yQ1ordkZNMzRsR3NLdDdTQ0thMlptbmRQNmdLTTV0alJWempways4ZnlJTUdBbXlSZE5peEZMbkJhMmxJRFVVdkRZSS9pTlVhQU1HZldYay81cHYxT3ljajFXRlhkMEErcmIvOXJycGE2cytoN2ZQSDVOaGZNYTF3Ymhsa3ZNcTM4Q1M5NmRndFBGVlZMai9PM3Y4c2Y0YlVKQzI3MzBkQ3JSck1USVM0Vi9nSkJwNkwrNzZGY3ova3VzTnhpRU45YU9WMlEzVnJwZ3hrd0ppb1c4SXc4TjJicnVITGQxRzdRcURoeHl3TmxaL0UyaHFyVVZLcHUzNDNnSFFLcTF0NUJjR0Zsd0pXN0k2dGtSNXZ6ZlpQbk93TyszcHFxcTdTNWhJeUlRZmt5RWZBQ2F3UktPcERnd1phelhIRW1FM01ZRkpoSnJ3N3NJblFmamNjT1VpeWRZUEpad3hVa3FFd3I2NW5YYk5VdjFjSVdGWUtQUE9acGpqY1Q4NFhFVjkwVU9IVHBDQUdhTFZEbWJXUk55SHhaUmhnWXRPeEpJQkFsdXI5a0RMd0lZZkZlY1N3N2JHNnR5UWxPVHJtUElabHFWUVVMUlFJeVk4amo2ZGRqbXR3QWZsUklwMTVaY1dwUmlSRlRCVllXWndXOVpyQjVIQUtDUW1tcUsrUzlkTXJORUlIQ3NLRjk5VXRhWXF1QUs5MjE2ejRoRUFTaDRxcU53UXlxeElUUFEyOE5FZjZwVlJBekl3VUdWNUZzTDZhM1JUUE1oWkRicjgxSU9mcVhTR1NBSUxhVXNSUjFQa3VTY2k2QjhVck5jU3RnMUkxRjhPV1NDc2FUVUNQT0YwczVqbllHMGE3emMranJmZlJNSWdYSVVzRVFsbndJWit3cHBaNjAzVUdqRXJ2VGlYRWlzRGxHWm9wVUpTYTg5UzRneHNDQnZDWVNqZE03Ky0tYTZhdEtWQUZrdnV4VzVtUklvczBEZz09--ef2e9e67b2d25648c1378e9c1b35909885485210; datadome=KBEERvotmLorGSHOYfPthvKy_R~9MyjJGeOESIuztZW__2Ed8873uQKiqyfcPuxLpFVLjQxFmRMUTD6uLAPbiuIGFJNIO~OLbBUXz7GraWrCW2Z_dvNK4Y8_QHc9~sMD; viewport_size=784",
          /*"Referer": "https://www.vinted.fr/catalog?time=1741633566&search_text=42151&page=1",
          "Referrer-Policy": "strict-origin-when-cross-origin"*/
        },
        /*referrer: `https://www.vinted.fr/catalog?search_text=${searchText}`,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null*/
      });
  
      if (response.ok) {
        const body = await response.json();
        return parse(body);
      }
  
      console.error('Error fetching data:', response);
      return null;
  
    } catch (e) {
      console.error('Error in scrape function:', e);
      return null;
    }
  };
  
  export { scrape };