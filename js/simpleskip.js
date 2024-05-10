// GLOBAL VARIABLES

let Settings;
let MoviePlayerPromise;
let MainVideoPromise;
let ActiveRecursiveInterval;
let ActiveRecursiveSkipper;
let LetTest = 1;

/**
 * ---
 * Runs on injection
 * - Only runs essential functions to check Settings
 * - Will run the rest of the program if MasterSwitch is true
 * 
 * ---
 * @returns {Promise<null>} Promise: null
 */
async function main(){
    await getDefaultSettings();
    await loadStoredSettings();

    startStorageListener();

    if (Settings["MasterSwitch"].selected_value)
            loadSimpleSkip();

    return null;

} main(); 


/**
 * ---
 * Creates promises for key variables
 * - Sets them up as global variables
 * 
 * ---
 * @returns {null} null
 */
function setupKeyVariables(){
    
    MoviePlayerPromise = promiseMoviePlayer();
    MainVideoPromise = promiseMainVideo(MoviePlayerPromise);

    ActiveRecursiveInterval = null;
    ActiveRecursiveSkipper = null;

    blackoutOverlay = null;

    return null;
}

/**
 * ---
 * Loads the main portion of SimpleSkip
 * 
 * Only runs if the MasterSwitch is true
 * 
 * ---
 * @returns {null} null
 */
async function loadSimpleSkip(){

    setupKeyVariables();

    if (Settings["BlackOut"].selected_value){        
        blackoutOverlay = new BlackoutOverlay(MoviePlayerPromise);
    }

    if (Settings["SkipAds"].selected_value || Settings["AutoMute"].selected_value || Settings["BlackOut"].selected_value){
        startMoviePlayerObserver();
    }

    if (Settings["InsertSkipButton"].selected_value)
        createSkipButton();



}

async function startMoviePlayerObserver(){

    var MoviePlayer = await MoviePlayerPromise;
    var MainVideo = await MainVideoPromise;

    const targetNode = MoviePlayer;

    const config = {childList: false, subtree: false, attributes: true};

    const callback = function(){
        if (MoviePlayer.classList.contains("ad-showing")){
            if (Settings["SkipAds"].selected_value){
                RecursiveSkip(MoviePlayer,MainVideo);
            }
            if (Settings["AutoMute"].selected_value){
                MuteVideo(MainVideo);
            }
            if (Settings["BlackOut"].selected_value){
                blackoutOverlay.show();
            }
        }
        else{
            if (Settings["BlackOut"].selected_value){
                blackoutOverlay.hide();
            }
        }
    }

    const mutationOBS = new MutationObserver(callback);
    mutationOBS.observe(targetNode, config);


}

//GROUP Control Video

function RecursiveSkip(MoviePlayer, MainVideo){

    // Clears the interval - Helper Function
    function ClearSkipper(){
        clickSkip();
        clearInterval(ActiveRecursiveSkipper);
        ActiveRecursiveSkipper = null;
        dprint("Recursive skipper interval cleared.");
        return null;
    }
    //--------------------------------------------------

    dprint("Recursive skip called...");

    if (!Settings["SkipAds"].selected_value){
        dprint("SkipAds is false. Cancelling.");
        return false;
    }

    // Checks for active interval
    if (ActiveRecursiveSkipper){
        dprint("Active recursive skipper found.");
        dprint("Recursive skip cancelled.");
        return false;
    }
    dprint("No active interval exists...");

    // Checks that elements exist
    if (!MoviePlayer || !MainVideo){
        dprint(`${MoviePlayer ? "" : "MoviePlayer "}${(!MoviePlayer && !MainVideo) ? "and " : ""}${MainVideo ? "" : "MainVideo "}not found.`);
        dprint("Recursive skip cancelled.");
        return false;
    }
    dprint("MoviePlayer and MainVideo found...");

    ActiveRecursiveSkipper = true; //Quick change to prevent other intervals from starting -> Not sure if needed.

    let maxTime = Settings["MaxRecursiveTime"].selected_value;
    let timeStamp = MainVideo.currentTime;

    ActiveRecursiveSkipper = setInterval(() => {
        
        if (!MoviePlayer.classList.contains("ad-showing")){
            return ClearSkipper();
        }

        MainVideo.currentTime += parseInt(Settings["RecursiveSkipTime"].selected_value);

        if (MainVideo.currentTime <= timeStamp || MainVideo.currentTime >= maxTime){
            return ClearSkipper();
        }

        timeStamp = MainVideo.currentTime;

    }, Settings["RecursiveSkipDelay"].selected_value);
    dprint("Recursive interval created.");

}

async function Skip(inputVideo = null){

    dprint(`Skip called${inputVideo!=null ? `: input video: ${inputVideo}` : "No input video supplied"}`);

    if (!inputVideo)
        var Video = await MainVideoPromise;
    else
        var Video = inputVideo;

    if (!Video){
        dprint("Video not found.");
        return;
    }
    dprint("Video found.");

    var MoviePlayer = await MoviePlayerPromise;

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
        console.log(MoviePlayer.classList);
        dprint("Skip called using Recursive");
        var timeStamp = Video.currentTime;
        var maxTime =  Settings["MaxRecursiveTime"].selected_value;
        // Video.pause(); --> Breaks blackout and skip

        // Get Video Wrapper
        MoviePlayer = await promiseElementsByClassName("html5-video-player", maxwait=5000);
        if (!MoviePlayer){
            dprint("Video wrapper not found.");
            return;
        }
        dprint("Video Wrapper Found");

        // Check if ad-showing
        if (!MoviePlayer.classList.contains("ad-showing")){
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
            if (!MoviePlayer.classList.contains("ad-showing")){
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


function MuteVideo(Video){

    if (Video){
        Video.muted = true;
        return true;
    };
    return false;

}

async function clickSkip(){
    dprint("Trying to click skip button...");
    let ytpSkip = await promiseElementsByClassName("ytp-ad-skip-button-modern", maxwait = 2000);
    if (ytpSkip) {
        dprint("Skip button found and clicked.");
        ytpSkip.click();
        return true;
    }
    dprint("Skip button not found.")
    return false;
}

//GROUP Elements
async function createBlackoutMessage(){

    var MoviePlayer = await MoviePlayerPromise;

    MoviePlayer.dataset.blackoutads = "true";

    let blackoutmessage = document.createElement("blackoutmessage");
    blackoutmessage.className = "blackoutmessage";
    blackoutmessage.id = "blackoutmessage";

    let messagetext = document.createElement("div");
    messagetext.innerText = "Ad is playing.";

    blackoutmessage.appendChild(messagetext);
    MoviePlayer.appendChild(blackoutmessage);
    
    return null;
}

function createSkipButton(){

    customSkipButton = new CustomSkipButton(MainVideoPromise,promiseElementsByClassName("ytp-chrome-controls"),Skip);

}

//GROUP Storage
function startStorageListener(){
    chrome.storage.onChanged.addListener((changes, namespace) => {
        dprint("\n---------changed------------\n");
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
          dprint(`Storage key "${key}" in namespace "${namespace}" changed.`,);
          dprint("Old:");
          for (let key of Object.keys(oldValue)){
            dprint(`${key}: ${oldValue[key]}`);
          }
          dprint("New:");
          for (let key of Object.keys(newValue)){
            dprint(`${key}: ${newValue[key]}`);
          }
        }
        dprint("\n---------changed------------\n");
        sendStorageNotification();
      });
}

function sendStorageNotification(){

    let oldnotification = document.getElementById("simpleskip-notification");
    if (oldnotification)
        return;

    let notification = document.createElement("div");
    notification.id = "simpleskip-notification";
    notification.className = "notification";

    let title = document.createElement("div");
    title.className = "notification-title";
    let spanLeft = document.createElement("span");
    spanLeft.innerText = "Simple";
    let spanRight = document.createElement("span");
    spanRight.innerText = "Skip";

    title.appendChild(spanLeft);
    title.appendChild(spanRight);
    
    notification.appendChild(title);

    let textcontent = document.createElement("div");
    textcontent.className = "notification-content";

    let textcontentLeft = document.createElement("span");
    textcontentLeft.innerText = "Settings changed - ";

    let reload = document.createElement("span");
    reload.className = ("notification-reload");
    reload.innerText = "Reload";
    reload.onclick = function(){
        window.location.reload();
    };

    let textcontentRight = document.createElement("span");
    textcontentRight.innerText = " the page to apply them.";

    textcontent.appendChild(textcontentLeft);
    textcontent.appendChild(reload);
    textcontent.appendChild(textcontentRight);

    notification.appendChild(textcontent);

    let closebutton = document.createElement("button");
    closebutton.className = "notification-closebutton";
    closebutton.innerText = "X";

    closebutton.onclick = function(){
        notification.remove();
    };

    notification.appendChild(closebutton);

    document.body.appendChild(notification);
}
