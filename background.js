importScripts('dexie.js');
const db = new Dexie("SteamMarketDB");
db.version(1).stores({

    items_info:`
        &key,
        name_code,
        item_id,
        price_sell,
        price_order,
        currency,
        timestamp
        
    `
    

});



async function savePrice(items) {
    const existing = await db.items_info.get(items.key);
    console.log(existing,items);
    
    //Dexie в данном случае сам создаст row если его нет.
    await db.items_info.put({
        ...existing,
        ...items
    });
}


chrome.runtime.onMessage.addListener((msg,sender, sendResponse)=>{
    console.log('work');
    savePrice(msg.data)
        .then(()=> sendResponse({ok: true}))
        .catch(err=> sendResponse({ok: false, error: err}));

    return true;



})