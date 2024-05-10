
class CustomSkipButton{

    constructor(MainVideoPromise, ChromeControlsPromise, SkipCallback){

        this.Element;
        this.MessageTextElement;

        this._init(MoviePlayerPromise, ChromeControlsPromise, SkipCallback);
    }

    async _init(MainVideoPromise, ChromeControlsPromise, SkipCallback){

        this.Element = document.createElement("CustomSkipButton");
        this.Element.id = "CustomSkipButton";

        let icon = document.createElement("img");
        icon.classList = "simpleskip-skipbutton-image";
        icon.src = chrome.runtime.getURL('assets/images/skip.png');

        this.Element.appendChild(icon);

        let MainVideo = await MainVideoPromise;
        this.Element.onclick = () => SkipCallback(MainVideo);

        let ChromeControls = await ChromeControlsPromise;
        ChromeControls.insertBefore(this.Element,ChromeControls.lastChild);
    }

    show(){
        this.Element.style.display = "flex";
        return;
    }
    hide(){
        this.Element.style.display = "none";
        return;
    }

}