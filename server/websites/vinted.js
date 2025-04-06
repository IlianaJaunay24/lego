import { v5 as uuidv5 } from 'uuid';

//const { title } = require("process");

const parse = data => {
    try {
      const { items } = data;
  
      return items.map(item => {
        const link = item.url;
        const price = item.total_item_price.amount;
        //const photo_url = item.user.photo.url || null;
        const { photo } = item;
        const published = photo.high_resolution && photo.high_resolution.timestamp;
  
        return {
          link,
          price,
          //photo_url,
          title: item.title,
          'published': new Date(published * 1000),//).toUTCString(),
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
          "cookie": "v_udt=UXkzWmFBQVVTY2Jpem92TkNTelZZTThqcFBoQi0teFpjNzN2V1hRVG9SZjIrSC0tZHBpc04ybG5wVkRPOW45bjM3b0hoQT09; anonymous-locale=fr; anon_id=90efd5db-b8a5-4917-acad-740ff88cbc33; ab.optOut=This-cookie-will-expire-in-2026; OptanonAlertBoxClosed=2025-01-06T14:49:33.495Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; v_sid=485178b0-1743774702; __cf_bm=kfRgHhtMzVA2JOP1ZMSd70cHRbCrIAclsvR5mHMeDHk-1743936971-1.0.1.1-rudavU9stRciNhUvkY.GYcGIhWFFZwsThefal73ZaWIBRZ.dZL7IH2f9_YKTPMoRWdakaP1ySUbikff57bIPUNHD4plGZNR3iGWisCY3SOkUmnBEYTj5hZJKe7At6EpR; cf_clearance=ahHO055D8pNlpIM1f7Lbp83b19znc8YzrhozBc6MCgs-1743936972-1.2.1.1-8_vidGCvY5ubWtAR1JTLFwKCfojOMqPuE8PHg.yZj8SmG8e7LDMhlcy2pBfjIHbOb35YUfsZVfcvN1KO69bqZrgoWaJUqJm1PwBK2ncSM.EYN6C5zEqsQ9VyBvq2gehCm5CkAKIuLDzSyLS7OpdIB0Wgfx.qeCo7pb7t_LVDq3PyQBWzv1ETrOHRimy8aGJYzHjyFDmQqsA.gEsqBSayHk16PjKHyUgRIDFzLBIDAD2is2bkHxkl2qhO1D4lEOFPOD4qXdJUW5dofseRf.CtlcuONEbpRrcbiEyUxfn9hmlJq6BLpj.Kd2IKYBuFMnd.4r2ZFCM2xD8dbAyRmWrvLDwoAGvHX9QAle5CN5TbcLE; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzOTM2OTcyLCJzaWQiOiI0ODUxNzhiMC0xNzQzNzc0NzAyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM5NDQxNzIsInB1cnBvc2UiOiJhY2Nlc3MifQ.FNdEmAGMMZWEhH52D5yz7OJRLCWf4JW5rK9ukN_DAM_saO45EeopwNvLwatHTFss-S162z1PoneOAQRvFnCFNvDckNWST92CgbPf4l9Wb0ndni3zOeuVXx_330RS6J8je7S-fvR-QJPkaHavYQVkN0hDzpxYS_MeB320Pv3ErdYDDVIMwIQRMS6n0UVD54zRsOCrqmbYWi3hbcxMdnabdUeDiqVvlDq8Xh0UMqqdcuQeyM7Ke9250C4UAlVkOss2xK-7rLLDra9HWXi9xgZUmddFHTEhGpKOlWSjRMKE-gyMOkyBs2me1xSuCyzG2blkRz4bp1vMgIx8UrbwpAc48A; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzOTM2OTczLCJzaWQiOiI0ODUxNzhiMC0xNzQzNzc0NzAyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQ1NDE3NzIsInB1cnBvc2UiOiJyZWZyZXNoIn0.iCvZEtPoNa8u_AYeU4AnCuU1MmHl6oEAtrdqKVqpRynZnX1_Nhhoq4DJ5vWlswDBvzvcOjZSNYdxgb4GTofBNGjcVjjdjUaB3VM-BCLu6PyjWVE_ti07ELCFjmQQxB7ehC2sTb3Pl8mLx1DWXDxLiFHd6EAL_Trmbt-uttS-ko5xYb0mr5irxgQDhduVQydBUgUJvRaITNoSFd0ZEJZkRe7t_QZ3CMmr-pomfnpgKsRpvoHOy85ivZbidR3eW320zdPRebOtgnR5ZS5WYmQgI5NyYZQf9Z1EUM2IhSbo2bNbGs08aSzgIEWv3QdYAfShfIBg7z5M-RtlGhObVWKybg; viewport_size=903; banners_ui_state=SUCCESS; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Apr+06+2025+12%3A56%3A34+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=90efd5db-b8a5-4917-acad-740ff88cbc33&interactionCount=50&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; datadome=G0wxY_1fgyZwxvP7VGc_BnBqtNcmjeD6Kk9MPM3hHV6LoatbDw~EL_1Q4Z59yigEFqhwhPgg0rjwWFH1p00MbePgAPAhxGp4VEC5Y~JuHL0Zwto7vLpZV6v6~TP8_3Z7; _vinted_fr_session=Z1cxbTFDVWRTd3VNcUVXL1g2S255NUFTMXJVNStBaElCazJnZzlCNDc1TEM2bjBWL2dUOTFxeFJjYmhlM2dGL204eFl6M2NvcmhlM0pFWVhlWEpuK2MvRDUvTnlwNkV0WnpkZVRqMWYwTW5SNGhLclRxYjBsUkF6aDhGUHpYM1VBYjFGS3I1eTY0WmZvbDUrQ1ZIdWhHbTROT281bC9yL0VyM0cveStoODNKa2NhR0V6RTkvTXJFZDFYS2podFk5ckNOUzArU0I3YzA1YkdjaUZaVTBzUno3N3R4aGpKbHlqbDduSUpTR0tCS0RoZG85QjBtWGNmTFRqY1A0OTBwZ082UzUwWFJRc1p0UTl6V2d4RTJwL0taRlg0T2lZcmt2d1FKb2xLSktVWW8wclRtV3dQWmMzK1R6eWQrR3FuNEpLc2xNYy9xL1R4YXZWNFJSR3VqSnZmYUg3RmovYjEwSXBSRlRCQjZsRjdycE5EaEdmZitrVGRSejczcGhOMktYVDhhZGIwbkFITGN3RndSWDdySTMrZGMzT0NaZFR1U1I3OG4xbHUvUnlCd24wbE01ZWJFRXZMbXdXL2twUS9TWlo0QnhFdE91TlRpbjRGczNnT0Fpbkp2QS9GTzJNa0IzblN5c0U2c205SGh2RS9zMkFmSUt0ZTFQc3hXNSszMmdkK3JzN3lwMWw2c2F0Z2ptSGk0WUhaRVBwNHJjZ1cwcFlFN0RCak1oWmx3cEY3TkJ1cm9qMVJIM2VsanYxbGFPUTZKTnlpa2g1R3RhMUhFeFdtYlZEYkN2K2hZZlp0aXhrelkzSWpNZEJJcWdoL2JpdkN4eXhOMXo5MXlmdlJXZGlUU294U3ZlUmN1aHNRaGpHL0FvdzhGVjJ4VHJQV1NTYzExSVVQc29sWTZmREk2YWR2WkMzaWE0S3RKTGRCZHB2SnlMREZuUDZORUlUZmVVZkthOVdUbnJrWVc2TFh0TFkyclRtaEZxMTB3VWxHU0NYeU53V1JzZXNLeE00Z2lqWTR6M1Jna1Q3ZnB2TGhSSjFoZ3pnNVdmZXl6SnZVa1lHRTBYTnQxK1NUajVDR05YR2RPT1NIcUZQVHlTakR4NFJ5SklOcDFGaytXMUhkUVd5a0dadnUwV0J4S1hTZ1hxUEJKK3dvTzZ3RkJjdUNMdStzVTBjUjNaaDdrdTF1bGhGaU1VYVR6SkpGa0lNcitySzVhdXZSeUFjakxaV2E5ZXM5ZlpkZzJwZEFoc2pOZFUydnlxUkRpYWswK0RZRCtpWEJvOVdYRHdZZElFclBEMFlOSW5SME9iS3NLQ2RrTldVNDVVQkpOckxUemRnSy80R0R4MGJXQ3VxMVNtTkxrK1NMTExIY2ovaGRuMkU3MStFZjR6THNPQnZRQWhGS0NJWFFDOXdzSG43VGNDUTh5ZWVDVklFV1BPNlRzRGc1TVZaQmFVTi9NNGpoekY2T1drdFZUTEhneFJWVU9iNTRMOGsvSmV5a1RzTlliQ3E3NU5tTXlDVnZnN0RiWWg5NjdGcEVweXpaRnAxNUR3alVOVmRXeXA1T0h3T1RlMUMwakp0b2s2REZ2OFNaMzl2WUErTVJxOHVYUjV3UDMwanRveURucWs2K2YrTmxlam1TTE0vNm9Vai9WUC9MK2FMdkF6azdCNHNraVl5MFNjbUZEUmJJb1FyTUsrRW1vdXFGcDRGVHZqUklDWXlXRGNEL2grVjZmN055N3RxRWhFaE91V3pOSWlsRmpNUm1iYy84L0h6RDRBWk9vNGVPajlLRjdBRlR6QnE5R204LzAyMXdQRHVjQkw4eDZlaGt3RXk5c1FxWkJiVW12bW5TQ0lRa2hQSVpEVEZIanJqcmV0K25oQURZSVJNaUIvbGIzL24wZTIzcGp5WllVZHF0bFpnc0VHbUpVYjJldkd0ZjZsQnlIRnNJTkFMSmRrblhuTjN3eDZrUDlmSmJ3MjVBMDhBUGtCZ09FeXNtOFRkcVFvVlNPRTM4aDFGQklWQm9ZRW5ndkd3RzB1Ry9ZakVLNkZRWEFCd3Y2cFlGVDIrZHFWUThDVndieU5tWUZlbXpMeUNvMzBjdXFROGVxTXhkZitkTW1MTHZzWVdOYS9hR0V6RkRaNmJ6cFJKNzZub2JhN20vZjBIL0t4M3g0YXNXNGR1Nk1hc2c4Y0QxT2E0VXF0d05qL2lEWlA3VDJxcUQ4LzlaQzBXMkl2WGV3N0REQmxrdW0wQTNCRUFUN0l3KzdvaE9BTStZVjc4K0pPQkQ3a2tWTDNZY2p1YXo0MHBmUVltR0RTQzQyZXNjQVNuSGNrdGJveEJJVlNPbnc2RFRFbEtBSjFzQ1NUY3lybElmck5kU094QVQ0ajhrYWVnWTFqYXN3VC0tZU5YeFJhVkxRZU5jTHNoQy94Y2VGUT09--753e77b37527c024e261d161cfb47fe2d92144c2",
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