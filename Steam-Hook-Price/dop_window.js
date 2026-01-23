document.addEventListener('DOMContentLoaded',async()=>{
    const main_count = document.createElement('div');
    const input_main = document.createElement('input');
    let all_data;
    
    all_data = await sendMessageAsync({
        type: 'db_get_all'
    });
    
    input_main.addEventListener('input',()=>{
        input_filtre(input_main.value);
    });
    main_count.classList.add('main_count');
    main_count.append(input_main);
    document.body.append(main_count);

    new CreateAllItems(all_data).create();
    
    
});


async function input_filtre(value) {
    const items = document.querySelectorAll('.popup_main_info');
    items.forEach(item=>{
        const name = item.getAttribute('data-name').toLowerCase();
        if(name.includes(value.toLowerCase())){
            item.closest('.small_div').style.display = '';
        }else{
            item.closest('.small_div').style.display = 'none';
        }
    });
}
class CreateAllItems{
    constructor(all_data){
        this.data = all_data.data;

    }
    create(){
        try{
            console.log(this.data);
            const all_items_div_show = document.createElement('div');
            all_items_div_show.classList.add('all_items_div_show');
            this.data.forEach(el => {
                const small_div = document.createElement('div');
                const info = document.createElement('span');

                small_div.classList.add('small_div');

                info.innerHTML = `<span data-name='${el.key}' data-time='${el.date}' 
                class='popup_main_info'> 
                ${el.key}<br>
                Price sell: ${el.price_sell}${el.currency}<br> 
                ${el.price_order? `Auto Buy: ${el.price_order}${el.currency}` : ''}<br>
                ${el.date} 
                <br>
                </span>
                
                `
                small_div.append(info);
                all_items_div_show.append(small_div);
            });

            document.body.append(all_items_div_show);
            return;
        }catch(err){
            console.log(err);
        }
       
    }
    
}


function sendMessageAsync(msg){
    return new Promise((resolve,reject)=>{
        chrome.runtime.sendMessage(msg,(response)=>{
            if(chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(response);
        });
    });
}