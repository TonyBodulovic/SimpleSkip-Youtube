
// NOTE :: Functions in this file refer to a global variable -> Settings
//
//      This variable is set in getDefaultSettings() however if it is set
//      within the scope of the js that calls it the other functions will
//      continue to work.
//------------------------------------------------------------------------

/**
 * ---
 * Retrieves default settings from `settings.json`
 * 
 * - Sets settings `object` if file and object exist
 * - Sets to `null` if not
 * ---
 * @returns {Promise} Promise: null
 */
async function getDefaultSettings(){
    try{
        Settings = await fetch(chrome.runtime.getURL("settings/settings.json"))
            .then((body)=>{return body.json();});
    }
    catch{
        Settings = null;
    }

    return null;
}

/**
 * ---
 * Loads user settings from Local Storage
 * - Updates `Settings` variable when a setting is found
 * - Pushes default to Local Storage if a setting is missing
 * ---
 * @returns {Promise} Promise: null
 */
async function loadStoredSettings(){

    let keyList = Object.keys(Settings);

    let keyRetrievalQueue = [];
    for (const key of keyList){
        keyRetrievalQueue.push(getLocalStorage(key));
    }
    let retrievedKeys = await Promise.all(keyRetrievalQueue);

    let keySetQueue = [];

    for (let index = 0; index < keyList.length; index++){
        let currentKey = retrievedKeys[index];
        if(currentKey != undefined){
            Settings[keyList[index]] = currentKey;
        }else{
            keySetQueue.push(setLocalStorage(keyList[index],Settings[keyList[index]]));
        }
    }

    await Promise.all(keySetQueue);

    return null;
}

/**
 * ---
 * Modifys a setting and updates the Local Storage
 * - If set succeeds, returns `object` containing old / new values
 * - If not function returns `false`
 * ---
 * @param {String} settingID
 * @param {Object} newValue
 * @returns {Object | false} Object | false
 */
async function modifySetting(settingID, newValue){

    let oldValue = Settings[settingID].selected_value;

    Settings[settingID].selected_value = newValue;
    let setStatus = await setLocalStorage(settingID, Settings[settingID]);

    if (setStatus){
        return {oldValue:oldValue,newValue:newValue};
    }
    return false;

}

/**
 * Gets and prints `Settings`
 * 
 * @returns {null} null
 */
function viewSettings(){
    for (const key of Object.keys(Settings)){
        console.log(`${key}: ${JSON.stringify(Settings[key])}`);
    }
    return null;
}
