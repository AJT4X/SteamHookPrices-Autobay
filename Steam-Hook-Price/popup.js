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
    const server = document.createElement('button');

    steam_hook_text.classList.add('sh_t');
    text_main_cont.classList.add('sh_t_cont');

    btns.classList.add('sh_t_cont','dop_btn');

    btns_save_json_file.classList.add('btns_json');
    btns_viwers.classList.add('btns_json');
    server.classList.add('btns_json');

    

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
    server.innerText = '📶';

    btns_save_json_file.type = 'button';
    btns_viwers.type = 'button';
    server.type = 'button';
    
    btns_save_json_file.addEventListener("click",()=>save_file(db_data));
    btns_viwers.addEventListener("click",()=>big_window());
    server.addEventListener('click',()=>local_server(db_data));
    btns.append(btns_save_json_file,btns_viwers,server);
    text_main_cont.append(steam_hook_text);
    document.body.append(text_main_cont,dop_main_info,btns);
}

function local_server(){
    try{
        const container_server = document.createElement('div');
        container_server.classList.add('sh_t_cont','border');

        let save;
        let status;

        chrome.storage.sync.get(["ip","ms","status"],(data)=>{
            save = data;
            const ipValue = data.ip || "ip";
            const ms = data.ms || 'ms';
            

            container_server.innerHTML = `
                <span style='color: white;'>
                The first input is the API address on your server where the JSON file for the entire database will be sent.
                The second input is the sending cycle under the hood. Every x(sec)*1000. 
                Where 1000 is 1 sec.<br> IP format "http://127.0.0.1:5009/save_db_hook (http://ip:port/api) or http://localhost:port/api"</span><br>
                        <input 
                        class='input_server' id='ip' 
                        placeholder="${ipValue}"
                        >
                        <input 
                            class='input_server smal' id='ms' placeholder='${ms}' style='width: 50px;'>
                            <br>
                            <button type='button' class='btns_json' id='save'>💾</button>
                            <button type='button' class='btns_json' id='status'></button>

        `;

        document.body.append(container_server);
        const status = document.getElementById('status');
        chrome.storage.sync.get(['status'],(data)=>{
            if(data.status=='on'){
                status.innerText = '🟢';

            }else{
                status.innerText = '🔴';
            }
        });

        status.addEventListener('click',()=>{

            let current;
            if(status.textContent === '🔴'){
                status.textContent = '🟢';
                current = 'on';
            }else{
                status.textContent = '🔴';
                current = 'off';
            }
            
            chrome.storage.sync.set({status: current});
        });

        const saved= document.getElementById('save');
        saved.addEventListener('click',()=>{
            
            const ip = document.getElementById('ip');
            const ms = document.getElementById('ms');
            
            chrome.storage.sync.set({ip: ip.value,ms:ms.value,last_send: Date.now()});
        });
        });

        

    }catch(err){
        console.log(err);
    }
}

function big_window(){
    chrome.windows.create({
        url: "dop_window.html",
        type: 'popup',
        width: 600,
        height: 400
    })
}


async function save_file(db_data){
    try{
       
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