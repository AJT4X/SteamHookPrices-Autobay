const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');

script.onload= () => script.remove();

document.documentElement.appendChild(script);


window.addEventListener('message',(event)=>{
    console.log(event);
});