
/**
 * ---
 * Promises an element by `id`
 * 
 * Function will wait until an element is created
 * - When the element is found, the `node` is returned
 * - If the element is not found within the maximum
 * wait time the fucntion will return a `String`
 * 
 * Function will NOT reject. Will return null if not found.
 * 
 * ---
 * @param {String} id
 * @param {Int} maxwait
 * @returns {Promise<Node|String>} Promise: Node | String
 */
function promiseElementById(id, maxwait = 0){

    return new Promise((resolve) => {

        if (document.getElementById(id)){
            resolve(document.getElementById(id));
            return;
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementById(id) != null){
                observer.disconnect();
                resolve(document.getElementById(id));
                return;
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        if (maxwait > 0){
            setTimeout(() => {
                dprint(`Element with id "${id}" not found within max time (${maxwait}ms)`);
                resolve(null);
                return;
            }, maxwait);
        }

    });

}

/**
 * ---
 * Promises element by `tag`
 * 
 * Function will wait until element is created
 * - If an index > 0 is given, it will look for the nth 
 * occurence of the tag where n = index
 * - When the element is found, the `node` is returned
 * - If the element is not found within the maximum
 * wait time the fucntion will return a `String`
 * 
 * Function will NOT reject. Will return null if not found.
 * 
 * ---
 * @param {String} tagName
 * @param {Int} maxwait
 * @param {Int} index
 * @returns {Promise<Node|String>} Promise: Node | String
 */
function promiseElementsByTagName(tagName, maxwait = 0, index = 0){

    return new Promise((resolve) => {

        if (document.getElementsByTagName(tagName).length >= index+1){
            resolve(document.getElementsByTagName(tagName)[index]);
            return;
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementsByTagName(tagName).length >= index+1){
                observer.disconnect();
                resolve(document.getElementsByTagName(tagName)[index]);
                return;
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        // MaxWait
        if (maxwait > 0){
            setTimeout(() => {
                dprint(`Element with tag "${tagName}" not found within max time (${maxwait}ms)`);
                resolve(null);
                return;
            }, maxwait);
        }

    });

}

/**
 * ---
 * Promises element by `class`
 * 
 * Function will wait until element is created
 * - If an index > 0 is given, it will look for the nth 
 * occurence of the class where n = index
 * - When the element is found, the `node` is returned
 * - If the element is not found within the maximum
 * wait time the fucntion will return a `String`
 * 
 * Function will NOT reject. Will return null if not found.
 * 
 * ---
 * @param {String} className
 * @param {Int} maxwait
 * @param {Int} index
 * @returns {Promise<Node|String>} Promise: Node | String
 */
async function promiseElementsByClassName(className, maxwait = 0, index = 0){

    return new Promise((resolve,reject) => {
        dprint(document.getElementsByClassName(className));
        if (document.getElementsByClassName(className).length >= index+1){
            resolve(document.getElementsByClassName(className)[index]);
            return;
        }
        
        const observer = new MutationObserver( () => {
            if (document.getElementsByClassName(className).length >= index+1){
                observer.disconnect();
                resolve(document.getElementsByClassName(className)[index]);
                return;
            }
        });

        observer.observe(document.body,{childList: true, subtree: true});

        if (maxwait > 0){
            setTimeout(() => {
                dprint(`Element with class "${className}" not found within max time (${maxwait}ms)`);
                resolve(null);
                return;
            }, maxwait);
        }

    });
}

/**
 * ---
 * Promises the main movie player
 * - Searches for element with ID "movie_player"
 * 
 * ---
 * @returns {Promise<Node>} Promise: Node
 */
function promiseMoviePlayer(){

    return new Promise((resolve,reject)=>{

        var playerQuery = () => {return document.getElementById("movie_player");};
        var player = playerQuery();

        if (player){
            resolve(player);
            return;
        }

        const observer = new MutationObserver(()=>{
            player = playerQuery();
            if (player){
                observer.disconnect();
                resolve(player);
                return;
            }
        })

        const targetNode = document.body;
        const config = {childList: true, subtree: true};
        observer.observe(targetNode, config);
    });

}

/**
 * ---
 * Promises the main video
 * - Requires MoviePlayer inputted as promise
 * - Searches within MoviePlayer children for video
 * 
 * ---
 * @param {Promise<Node>} MoviePlayerPromise
 * @returns {Promise<Node>} Promise: Node
 */
async function promiseMainVideo(MoviePlayerPromise){

    var MoviePlayer = await MoviePlayerPromise;
    
    return await new Promise((resolve, reject) => {

        var videoQuery = () => { return MoviePlayer.getElementsByTagName("video"); };
        var queryResults = videoQuery();

        if (queryResults) {
            resolve(queryResults[0]);
            return;
        }

        const observer = new MutationObserver(() => {
            queryResults = videoQuery();
            if (queryResults) {
                observer.disconnect;
                resolve(queryResults[0]);
                return;
            }
        });

        const targetNode = MoviePlayer;
        const config = { childList: true, subtree: true };
        observer.observe(targetNode, config);
    });

}