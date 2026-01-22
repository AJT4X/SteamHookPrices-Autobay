(function(){
    var TARGET = ["https://steamcommunity.com/market/priceoverview",
        "https://steamcommunity.com/market/itemordershistogram"
    ];

    let url_split;
    const originOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method,url,...rest){

        this._url = url;
        return originOpen.apply(this,[method,url,...rest]);

    };

    const originSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function(...args){
        this.addEventListener('load',function(){
            try{
                
                if(!this._url)
                    return;
                
                if(!TARGET.some(t=>this._url.startsWith(t)))
                    return;
                
               
                let data;

                try{
                    data = JSON.parse(this.responseText);

                }catch{
                    data = this.responseText;
                }
                url_split = new URL(this._url).pathname.split('/').pop();
                
                window.postMessage({
                    type: url_split,
                    url: this._url,
                    payload: data

                },"*");
            }catch(e){
                console.warn('Error XHR',e);
            }
        });
        return originSend.apply(this,args);
    };

    const originFetch = window.fetch;
    window.fetch = async (...args) =>{
        const response = await originFetch(...args);
        try{
            const url = args[0]?.url || args[0].toString();
            if(!TARGET.some(t=>url.startsWith(t)))
                return;

            const clone = response.clone();
            const text = await clone.text();
            let data;

            try{
                data = JSON.parse(text);

            }catch{
                data = text;
            }
            
            const new_url = new URL(clone.url);
            url_split = new_url.pathname.split('/').filter(Boolean).pop();
            

            window.postMessage({
                type:url_split,
                url: clone.url,
                payload: data
            })
            
        }catch(e) {
            console.log(e);
        }
        return response;
    }
    

})();

