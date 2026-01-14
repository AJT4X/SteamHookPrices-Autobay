document.addEventListener('DOMContentLoaded',()=>{
    start()
});

async function start() {
    const tooday = new Date();
    tooday.setHours(0,0,0,0);

    const text_main_cont = document.createElement('div');
    const dop_main_info = document.createElement('div');
    const btns = document.createElement('div');

    const steam_hook_text = document.createElement('span');
    const btns_save_json_file = document.createElement('button');
    const btns_viwers = document.createElement('button');

    steam_hook_text.classList.add('sh_t');
    text_main_cont.classList.add('sh_t_cont');

    btns.classList.add('sh_t_cont','dop_btn');

    btns_save_json_file.classList.add('btns_json');
    btns_viwers.classList.add('btns_json');

    

    let db_data;
    
    db_data = await sendMessageAsync({
        type: 'db_get_all',
    });
    
    
    let length_tooday = db_data.data
        .filter(row=> row.timestamp >= tooday.getTime());

    console.log(db_data.data.length);
    console.log(length_tooday.length);

    steam_hook_text.innerText = 'STEAM HOOK';
    dop_main_info.innerHTML =`
    <div class="sh_t_cont dop_style"><span class="sh_t">All items: ${db_data.data.length} pcs
     | Tooday hooks: ${length_tooday.length} pcs</span></div>
    `;
    btns_save_json_file.innerText = '📥';
    btns_viwers.innerText = '👁️';

    btns_save_json_file.addEventListener("click",()=>save_file(db_data));

    btns.append(btns_save_json_file,btns_viwers);
    text_main_cont.append(steam_hook_text);
    document.body.append(text_main_cont,dop_main_info,btns);
}

async function save_file(db_data){
    try{
        console.log(db_data);
        const data_main =  db_data.data;
        const jsonStringfy = JSON.stringify(data_main,null,2);

        const blob = new Blob([jsonStringfy],{type: "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "steam_hook.json";
        a.click();

        URL.revokeObjectURL(url);
        return;
    }catch(err){
        console.log(err);
    }
   
}
function sendMessageAsync(msg){
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(msg,(response)=>{
            if(chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(response);
        });

    });
}