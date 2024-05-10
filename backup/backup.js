
// MAIN
function main(){

    clearLocalStorage();
    setDefaults();
    
    loadSettings()
    .then(()=>{
        if (Settings["MasterSwitch"])
            loadSimpleSkip();
    });

} main();

// LoadSimpleSkip
function loadSimpleSkip(){

    if (Settings["InsertSkipButton"])
        createSkipButton();

}

// FUNCTION Set Defaults
function setDefaults(){

    Settings = {
        "MasterSwitch" : true,
        "InsertSkipButton" : true,

        "SkipMethod" : "Set",
        "SkipVideoSearchTimeout" : 1000,

        "SetSkipTime" : 10000000,

        "RecursiveSkipTime" : 1,
        "RecursiveSkipDelay" : 200
    }
}

//FUNCTION Skip
function Skip(inputVideo = null){

    if (!inputVideo)
        VideoPromise = promiseElementsByTagName("video", maxwait = Settings["SkipVideoSearchTimeout"]);
    else
        VideoPromise = new Promise((resolve)=>{resolve(inputVideo)});

    VideoPromise.then((Video)=>{

        Video.muted = true;

        if (Settings["SkipMethod"] == "Set"){
 
            Video.currentTime = Settings["SetSkipTime"];
            Video.muted = false;

        }

        else if(Settings["SkipMethod"] == "Recursive"){
            console.log(Video);
            var timeStamp = Video.currentTime;
            var RecursiveSkipper = setInterval(() => {
                console.log(Video.currentTime);
                Video.currentTime += Settings["RecursiveSkipTime"];

                if (Video.currentTime <= timeStamp){
                    clearInterval(RecursiveSkipper);
                    Video.currentTime = timeStamp;
                    Video.muted = false;
                }else{
                    timeStamp = Video.currentTime;
                }

            }, Settings["RecursiveSkipDelay"]);

        }

    },(reason)=>{
        console.log(reason)
    });

}

//FUNCTION Create Skip Button
function createSkipButton(){
    Promise.all([
        promiseElementsByTagName("video"),
        promiseElementsByClassName("ytp-chrome-controls")
    ])
    .then((retrievedElements)=>{

        var Video = retrievedElements[0];
        var ChromeControls = retrievedElements[1];

        var CustomSkip = document.createElement("button");
        CustomSkip.title = "Skip to end";
        CustomSkip.classList = "ytp-button simpleskip-skipbutton";
    
        CustomSkip.onclick = function(){
            Skip(Video);
        }
    
        let icon = document.createElement("img");
        icon.classList = "simpleskip-skipbutton-image";
        icon.src = chrome.runtime.getURL('assets/images/skip.png');
        CustomSkip.appendChild(icon);
        ChromeControls.insertBefore(CustomSkip,ChromeControls.lastChild);

    });

}

// --------------------------------------------

// FUNCTION Testing
function testing(){
    // getLocalStorage("test").then((result)=>console.log(result));
    // setLocalStorage("test",1000);
    // clearLocalStorage();
    // viewLocalStorage();
    // setLocalStorage("Settings",{Setting1:10,Setting2:100});
    // viewLocalStorage();
    // getLocalStorage("Settings").then((result)=>console.log(result));
    clearLocalStorage();
    // setLocalStorage("MasterSwitch","TEST");
    setDefaults();
    loadSettings().then(()=>{
        viewLocalStorage();
    });
}




// SECTION Variables


// SECTION Elements
// FUNCTION Getting Key Elements
async function getKeyElements(){
    VIDEOWRAPPER = (await promiseElementsByClassName("html5-video-player"))[0];
    VIDEO = (await promiseElementsByTagName("video"))[0];
    ADMODULE = (await promiseElementsByClassName("ytp-ad-module"))[0];
}

// FUNCTION Create Custom Elements
function createCustomElements(){

    promiseElementsByClassName("ytp-chrome-controls")
    .then((elements)=>{ return elements[0]; })
    .then((chromeControls) => {

        CUSTOMSKIP = document.createElement("button");
        CUSTOMSKIP.title = "Skip to end";
        CUSTOMSKIP.classList = "ytp-button simpleskip-skipbutton";
    
        CUSTOMSKIP.onclick = function(){
            try{
                console.log("HERE");
                VIDEO.currentTime = 10000;
                console.log("THERE");
            }catch (error){
                console.log("Caught Error:: ", error);
            }
            try{
                document.getElementsByClassName("ytp-ad-skip-button-modern")[0].click();
            }catch (error){
                console.log("Caught Error:: ", error);
            }
        }
    
        let icon = document.createElement("img");
        icon.classList = "simpleskip-skipbutton-image";
        icon.src = chrome.runtime.getURL('assets/images/skip.png');
        CUSTOMSKIP.appendChild(icon);
        chromeControls.insertBefore(CUSTOMSKIP,chromeControls.lastChild);
    });

}

// FUNCTION Ad Module Observer
function startAdModuleObserver(){

    const targetNode = ADMODULE;
    const config = {attributes: false, childList: true, subtree: false};

    const callback = function(){
        if (ADMODULE.children.length > 0){
            startSkipper();
        }
    };

    const mutationOBS = new MutationObserver(callback);

    if (ADMODULE.children.length > 0){  //Incase ad is already running
        startSkipper();
    }

    mutationOBS.observe(targetNode, config);

}

// FUNCTION Start Skipper
function startSkipper(){

    VIDEO.muted = true;

    const skipper = setInterval(function(){

        console.log("Skipper Fired");

        if (ADMODULE.children.length > 0){
            console.log("Ad Module Child Found");
            try {
                VIDEO.currentTime = 10000;
                document.getElementsByClassName("ytp-ad-skip-button-modern")[0].click();
            } catch (error) {
                console.log("Caught Error:: ", error);
            }
        }
        else{
            VIDEO.muted = false;
            clearInterval(skipper);
        }

    },100);

}

// SECTION Helpers
// GROUP Await Elements
// FUNCTION Promise Id
function promiseElementById(id, maxwait = 0){

    return new Promise((resolve,reject) => {

        if (document.getElementById(id)){
            resolve(document.getElementById(id) != null);
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementById(id) != null){
                observer.disconnect();
                resolve(document.getElementById(id));
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        // MaxWait
        if (maxwait > 0){
            setTimeout(() => {
                reject(`Element with id "${id}" not found within max time (${maxwait}ms)`);
            }, maxwait);
        }

    });

}

// FUNCTION Promise Tag
function promiseElementsByTagName(tagName, maxwait = 0, index = 0){

    return new Promise((resolve,reject) => {

        if (document.getElementsByTagName(tagName).length >= index+1){
            resolve(document.getElementsByTagName(tagName)[index]);
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementsByTagName(tagName).length >= index+1){
                observer.disconnect();
                resolve(document.getElementsByTagName(tagName)[index]);
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        // MaxWait
        if (maxwait > 0){
            setTimeout(() => {
                reject(`Element with tag "${tagName}" not found within max time (${maxwait}ms)`);
            }, maxwait);
        }

    });

}

// FUNCTION Promise Class
async function promiseElementsByClassName(className, maxwait = 0, index = 0){

    return new Promise((resolve,reject) => {

        if (document.getElementsByClassName(className).length >= index+1){
            resolve(document.getElementsByClassName(className)[index]);
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementsByClassName(className).length >= index+1){
                observer.disconnect();
                resolve(document.getElementsByClassName(className)[index]);
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        // MaxWait
        if (maxwait > 0){
            setTimeout(() => {
                reject(`Element with class "${className}" not found within max time (${maxwait}ms)`);
            }, maxwait);
        }

    });
}

// GROUP Local Storage
// FUNCTION Get Storage Item
async function getLocalStorage(key){
    let value = await chrome.storage.local.get([key]).then(result => result[key]);

    return value;
}

// FUNCTION Set Storage Item
async function setLocalStorage(key,value){
    let pair = {};
    pair[key] = value;
    await chrome.storage.local.set(pair);
}

// FUNCTION View All Storage
function viewLocalStorage(){
    chrome.storage.local.get().then((items)=>{
        for (const key in items){
            console.log(`${key}: ${items[key]}`);
        }
    });
}

// FUNCTION Clear Storage
function clearLocalStorage(){
    chrome.storage.local.clear();
}

// GROUP Settings
// FUNCTION Load Settings
async function loadSettings(){

    let keyList = Object.keys(Settings);

    let keyRetrievalQueue = [];
    for (const key of keyList){
        keyRetrievalQueue.push(getLocalStorage(key));
    }
    let retrievedValues = await Promise.all(keyRetrievalQueue);

    for (let index = 0; index < keyList.length; index++){
        let currentValue = retrievedValues[index]
        if(currentValue != undefined){
            Settings[keyList[index]] = currentValue;
        }else{
            setLocalStorage(keyList[index],Settings[keyList[index]]);
        }
    }
}

// FUNCTION View Settings
function viewSettings(){
    
    for (const key of Object.keys(Settings)){
        console.log(`${key}: ${Settings[key]}`);
    }

}


function setSettings(){
    return;
}

// GROUP Other
function genericfunc(){return;}


function aSkip(inputVideo = null){

    dprint(`Skip called${inputVideo!=null ? `: input video: ${inputVideo}` : "No input video supplied"}`);

    if (!inputVideo)
        VideoPromise = promiseElementsByTagName("video", maxwait = Settings["SkipVideoSearchTimeout"].selected_value);
    else
        VideoPromise = new Promise((resolve)=>{resolve(inputVideo)});

    VideoPromise.then((Video)=>{

        if (Settings["AutoMute"].selected_value)
            Video.muted = true;

        if (Settings["SkipMethod"].selected_value == "Set"){
            Video.currentTime = Settings["SetSkipTime"].selected_value;
            clickSkip();
            Video.muted = false;

        }

        else if(Settings["SkipMethod"].selected_value == "Recursive"){

            var timeStamp = Video.currentTime;
            Video.pause();

            promiseElementsByClassName("ytp-ad-module", maxwait=5000).then((AdModule)=>{

                if (AdModule.children.length > 0){

                    var RecursiveSkipper = setInterval(() => {
                        Video.currentTime += parseInt(Settings["RecursiveSkipTime"].selected_value);
                        if (Video.currentTime <= timeStamp){
                            clickSkip();
                            Video.muted = false;
                        }
                        else{
                            timeStamp = Video.currentTime;
                        }
                        if (AdModule.children.length <= 0){
                            Video.currentTime = 0;
                            clearInterval(RecursiveSkipper);
                        }

                    }, Settings["RecursiveSkipDelay"].selected_value);
                }

                else{
                    var RecursiveSkipper = setInterval(() => {
                        Video.currentTime += parseInt(Settings["RecursiveSkipTime"].selected_value);
                        if (Video.currentTime <= timeStamp){
                            clickSkip();
                            Video.currentTime = 0;
                            Video.muted = false;
                            clearInterval(RecursiveSkipper);
                        }else{
                            timeStamp = Video.currentTime;
                        }
        
                    }, Settings["RecursiveSkipDelay"].selected_value);
                }
            });


        }

    },(reason)=>{
        dprint(reason);
    });

}

function startAdmoduleObserver(){

    promiseElementsByClassName("ytp-ad-module").then((AdModule)=>{
        const targetNode = AdModule;
        const config = {attributes: false, childList: true, subtree: true};

        const callback = function(){
            if (AdModule.children.length > 0){
                if (Settings["SkipAds"].selected_value)
                    Skip();
                if (Settings["AutoMute"].selected_value)
                    MuteVideo();
                dprint("Ad child found");
            }
        }

        const mutationOBS = new MutationObserver(callback);
        mutationOBS.observe(targetNode, config);

        if (AdModule.children.length > 0){  //Incase ad is already running when observer is called
            if (Settings["SkipAds"].selected_value)
                Skip();
            if (Settings["AutoMute"].selected_value)
                MuteVideo();
        }

    });

}

async function Skip(inputVideo = null){

    dprint(`Skip called${inputVideo!=null ? `: input video: ${inputVideo}` : "No input video supplied"}`);

    if (!inputVideo)
        var Video = await promiseElementsByTagName("video", maxwait = Settings["SkipVideoSearchTimeout"].selected_value);
    else
        var Video = inputVideo;

    if (!Video){
        dprint("Video not found.");
        return;
    }
    dprint("Video found.");

    if (Settings["AutoMute"].selected_value)
        dprint("Video muted.");
        Video.muted = true;

    if (Settings["SkipMethod"].selected_value == "Set"){
        dprint("Skip called using Set");
        Video.currentTime = Settings["SetSkipTime"].selected_value;
        clickSkip();
        Video.muted = false;
    }

    else if(Settings["SkipMethod"].selected_value == "Recursive"){
        console.log(VideoWrapper.classList);
        dprint("Skip called using Recursive");
        var timeStamp = Video.currentTime;
        var maxTime =  Settings["MaxRecursiveTime"].selected_value;
        // Video.pause(); --> Breaks blackout and skip

        // Get Video Wrapper
        VideoWrapper = await promiseElementsByClassName("html5-video-player", maxwait=5000);
        if (!VideoWrapper){
            dprint("Video wrapper not found.");
            return;
        }
        dprint("Video Wrapper Found");

        // Check if ad-showing
        if (!VideoWrapper.classList.contains("ad-showing")){
            dprint("Video wrapper class does not have ad-showing - Not starting interval.");
            return;
        }
        dprint("Class contains ad-showing - Starting interval.");
        
        // Check for active interval
        if (ActiveRecursiveInterval != null){
            dprint("Interval already active. - Cancelling.");
            return;
        }
        dprint("No active interval found - Continuing...");

        ActiveRecursiveInterval = setInterval(() => {
            if (!VideoWrapper.classList.contains("ad-showing")){
                clickSkip();
                Video.muted = false;
                clearInterval(ActiveRecursiveInterval);
                dprint("Interval cleared.");
                ActiveRecursiveInterval = null;
            }
            else{
                Video.currentTime += parseInt(Settings["RecursiveSkipTime"].selected_value);
                if (Video.currentTime >= timeStamp){
                    if (Video.currentTime >= maxTime){
                        dprint("MaxRecursiveTimeReached");
                        Video.currentTime = Settings["SetSkipTime"].selected_value;
                        clickSkip();
                        Video.muted = false;
                        clearInterval(ActiveRecursiveInterval);
                        dprint("Interval cleared.");
                        ActiveRecursiveInterval = null;
                    }
                    else{
                        timeStamp = Video.currentTime;
                    }
                }
                else{
                    clickSkip();
                    Video.muted = false;
                    clearInterval(ActiveRecursiveInterval);
                    dprint("Interval cleared.");
                    ActiveRecursiveInterval = null;
                }
            }
        }, Settings["RecursiveSkipDelay"].selected_value);
    }
}

function MuteVideo(inputVideo = null){

    if (!inputVideo)
        VideoPromise = promiseElementsByTagName("video", maxwait = Settings["SkipVideoSearchTimeout"].selected_value);
    else
        VideoPromise = new Promise((resolve)=>{resolve(inputVideo)});

    VideoPromise.then((Video)=>{
        Video.muted = true;
    });

}

function createSkipButton(){
    Promise.all([
        promiseElementsByTagName("video"),
        promiseElementsByClassName("ytp-chrome-controls")
    ])
    .then((retrievedElements)=>{

        var Video = retrievedElements[0];
        var ChromeControls = retrievedElements[1];

        var CustomSkip = document.createElement("button");
        CustomSkip.title = "Skip to end";
        CustomSkip.classList = "ytp-button simpleskip-skipbutton";
    
        CustomSkip.onclick = function(){
            Skip(Video);
        }
    
        let icon = document.createElement("img");
        icon.classList = "simpleskip-skipbutton-image";
        icon.src = chrome.runtime.getURL('assets/images/skip.png');
        CustomSkip.appendChild(icon);
        ChromeControls.insertBefore(CustomSkip,ChromeControls.lastChild);
    });

}