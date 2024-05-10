/**
 * ---
 * NOTE: Assumes global variable `Settings` is set
 * 
 * Prints the `content` if DebugPrint is enabled
 * 
 * ---
 * @param {Any} content 
 * @returns {null} null
 */
function dprint (content = ""){
    if (Settings["DebugPrint"].selected_value){
        console.log(content);
    }
    return;
}