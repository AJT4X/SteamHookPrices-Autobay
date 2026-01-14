const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');

script.onload= () => script.remove();

document.documentElement.appendChild(script);


window.addEventListener('message',(event)=>{
    const {type, payload, url} = event.data || {};

    const params = url ? new URLSearchParams(url) : null;
    let timestamp =  Date.now();
    switch(type){
        case"priceoverview":{

            data_send = {
                key: params.get('market_hash_name'),
                price_sell: parseFloat(payload.lowest_price),
                currency : payload.lowest_price.at(-1),
                timestamp,
                date: new Date(timestamp)
                
            }
            if(data_send.price_sell > 0){
                new SM(data_send,"priceoverview").send();
                new Alertik(data_send).create();
            }
            
            break
        }
        case "itemordershistogram":{
            let data_send;
            const price_sell = parseFloat(payload.lowest_sell_order/100);
            const price_order = parseFloat(payload.highest_buy_order/100);
            const id = params.get('item_nameid');
            const name_code = new URL(window.location.href).pathname.split('/').pop();
            const name_decode = decodeURI(name_code);
            const currency = payload.price_suffix;
            data_send = {
                key : name_decode.replace(/%26/g,'').replace("  "," "),//Все /%26 удаляем
                name_code: name_code,
                item_id: id,
                price_sell: price_sell,
                price_order: price_order,
                currency: currency,
                timestamp,
                date: new Date(timestamp)
            }
            if (price_sell && price_order > 0){
                new SM(data_send, "itemordershistogram").send();
                new Alertik(data_send).create();
            }
            
            break
        }
    }
});


class Alertik{
    constructor(data){
        this.data = data;
    }

    create(){
        console.log('create');
        const blocks_alert_info = document.createElement('div');
        blocks_alert_info.classList.add('alertis_hook');
        const alert_text = document.createElement('span');
        alert_text.innerHTML = `${this.data.key} - ${this.data.price_sell}${this.data.currency}`;
        blocks_alert_info.append(alert_text);
        document.body.append(blocks_alert_info);
        setTimeout(()=>{
            blocks_alert_info.remove();
        },700);
        return;
    };

    
}
class SM{
    constructor(data,type){
        this.data = data;
        this.type = type;
    }
    send(){
        console.log('send');
        chrome.runtime.sendMessage({
            type:this.type,
            data: this.data
    });
    return;
    }
}