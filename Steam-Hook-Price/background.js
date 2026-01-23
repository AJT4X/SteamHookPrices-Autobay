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

let ms;
let last_send;

async function all_db() {
    return await db.items_info.toArray();
}


async function savePrice(items) {
    const existing = await db.items_info.get(items.key);
    
    //Dexie в данном случае сам создаст row если его нет.
    await db.items_info.put({
        ...existing,
        ...items
    });
}

async function send_server(){
   
    const alls = await all_db();
    if (alls){

        try{
            const data = await getStorage(['ip','ms','status','last_send']);

                const ip = data.ip || 0;
                ms = data.ms || 0;
                last_send = data.last_send || 0;
                const status = data.status;

                const now = Date.now();
                

                if(status !== 'on') return;
                if(!ip) return;
                if(now - last_send < ms){
                    console.log('Too early to send. Wait...');
                    return;
                }

            const response = await fetch(ip,{
                method: 'POST',
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(alls)
        });
        console.log('Data send successfuly!');
        if (!response.ok){
            console.log('Hook: "server return error...or not working...');
            return;
        }
        chrome.storage.sync.set({last_send: now});
                
        }catch(err){
            console.log(err);
        }
        }

        return;
}

async function getStorage(keys) {
    return new Promise((resolve)=>{
        chrome.storage.sync.get(keys,resolve);
    });
    
}

chrome.runtime.onMessage.addListener((msg,sender, sendResponse)=>{
    if (msg.type == 'itemordershistogram' || 
        msg.type == 'priceoverview'){
        savePrice(msg.data)
            .then(()=> sendResponse({ok: true}))
            .catch(err=> sendResponse({ok: false, error: err}));
    }
    if(msg.type=='db_get_all'){
       
        all_db()
        .then(data=> sendResponse({ok: true, data}))
        .catch(err=> sendResponse({ok: false, error: err}))

    }
    if (msg.type=='send_server'){
        console.log(msg);
        send_server();
    }
   

    return true;



})