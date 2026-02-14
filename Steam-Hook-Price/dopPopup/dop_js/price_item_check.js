export function price_check() {
    const clear = document.getElementById('serverCont');
    console.log(clear);
    if(clear){
        clear.remove();
    }
    
    chrome.windows.create({
        url: "dopPopup/find_price.html",
        type: "popup",
        width: 400,
        height: 200
    });

}