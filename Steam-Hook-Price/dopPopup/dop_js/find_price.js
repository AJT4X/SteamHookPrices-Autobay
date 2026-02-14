import { currency_json } from "../../dopJson/currency.js";


document.addEventListener('DOMContentLoaded',async ()=>{
    let currency_pic;
    let local_currency;
    const main_div_price_check = document.createElement('div');
    const input_main = document.createElement('input');
    const input_name_info = document.createElement('div');
    const get_price_btn = document.createElement('button');
    
    
    const select_currency = document.createElement('select');

    main_div_price_check.classList.add('main_div_price_check');
    select_currency.classList.add('currency_select');
    
    input_main.placeholder='AK-47 | Slate (Well-Worn)';

    get_price_btn.innerText = '🔎';
    get_price_btn.type = 'pointer';
    
    const get_currency = await get_storage();
    if(get_currency){
        currency_pic = currency_json[get_currency];
    }
    

   

    for(const [code,id] of Object.entries(currency_json)){
        const currency_option = document.createElement('option');
        currency_option.classList.add('currency_option');
        currency_option.style.color = 'white';
        currency_option.innerText = code;
        
        select_currency.appendChild(currency_option);
    }
    select_currency.addEventListener('change',(event)=>{
        local_currency = event.target.value;
        chrome.storage.sync.set({currency: local_currency});
        currency_pic = currency_json[local_currency];
    });
    
    select_currency.value = get_currency;

    get_price_btn.addEventListener('click',async ()=>{
        
        const old_div_check = document.querySelector('.price_info_style');
        if (old_div_check){
            old_div_check.remove();
        }
        if(input_main.value){
            const reponse = await response_func(input_main.value,currency_pic);
            if (reponse){
                const price_info = document.createElement('div');
                const info_price_find = document.createElement('span');

                info_price_find.style.color = 'White';
                info_price_find.style.fontSize = '18px';
                info_price_find.innerText = `Response return: ${reponse}`;
                price_info.classList.add('price_info_style');

                price_info.append(info_price_find);
                document.body.append(price_info);
            }
        };
        
    });

    input_name_info.append(input_main,select_currency,get_price_btn);
    main_div_price_check.append(input_name_info);
    document.body.append(main_div_price_check);


});


async function get_storage(){
    console.log('gs');
    return new Promise((resolve)=>{
        chrome.storage.sync.get(['currency'],(data)=>{
            console.log(data);
        
            resolve(data.currency || "USD");
        });
        
    });
}
async function response_func(item_name,currency) {
    console.log(item_name,currency);
    const url = `https://steamcommunity.com/market/priceoverview/?country=EN&currency=${currency}&appid=730&market_hash_name=${encodeURIComponent(item_name)}`;
    const response = await fetch(url);
    const data = await response.json();
    if(data.lowest_price){
        return data.lowest_price;
    }else{
        return null;
    }
}

