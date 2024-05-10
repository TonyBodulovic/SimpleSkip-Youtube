/**
 * ---
 * Retrieves `key` from LocalStorage
 * 
 * - If the key exists, returns an `object`
 * - If the key is not found, returns `null`
 * 
 * If no params are given, will return entire LocalStorage
 * - If LocalStorage is empty, will return null.
 * 
 * ---
 * @param {String} key
 * @returns {Promise} Promise: object | null
 */
async function getLocalStorage(key = null){
    
    let value = null;
    let retrievalResult = null;

    if (!key){
        retrievalResult = await chrome.storage.local.get();
        if (retrievalResult){
            if (Object.keys(retrievalResult).length !=0)
                value = retrievalResult;
        }
    }
    else{
        retrievalResult = await chrome.storage.local.get([key]);
        if (retrievalResult){
            if (Object.keys(retrievalResult).length !=0)
                value = retrievalResult[key];
        }
    }

    return value;
}

/**
 * ---
 * Sets `key` to `value` in LocalStorage
 * 
 * - Returns `true` on success
 * - Returns `false` on failure
 * 
 * ---
 * @param {String} key 
 * @param {any} value 
 * @returns {Promise<boolean>} Promise: boolean
 */
function setLocalStorage(key,value){
    let pair = {};
    pair[key] = value;

    /* 
    Not sure if setting local storage can even fail

    Leaving this here for testing,once confirmed it can't fail 
        will remove unnecessary onreject function
    */
    chrome.storage.local.set(pair).then(()=>{
        return true;
    },(reason)=>{
        console.log(`SETTING LOCAL STORAGE FAILED: ${reason}`);
        return false;
    });
}

/**
 * ---
 * Clears LocalStorage
 * 
 * Function returns a promise
 * - Can be awaited
 * 
 * ---
 * @returns {Promise<void>} Promise: void
 */
function clearLocalStorage(){
    return chrome.storage.local.clear();
}

/**
 * ---
 * Gets and prints LocalStorage
 * 
 * Prints empty message if no items exist
 * 
 * ---
 */
function viewLocalStorage(){
    chrome.storage.local.get().then((items)=>{
        if (Object.keys(items).length != 0){
            for (const key in items){
                console.log(`${key}: ${items[key]}`);
            }
        }
        else{
            console.log("LocalStorage Empty.");
        }
    });
}

