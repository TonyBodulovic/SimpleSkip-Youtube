

class BlackoutOverlay{

    constructor(MoviePlayerPromise){
        this.Element;
        this.MessageTextElement;

        this._init(MoviePlayerPromise);
    }

    async _init(MoviePlayerPromise){
        this.Element = document.createElement("BlackoutOverlay");
        this.Element.id = "BlackoutOverlay";

        this.MessageTextElement = document.createElement("div");
        this.MessageTextElement.innerText = "Ad is playing.";
        
        this.Element.appendChild(this.MessageTextElement);

        let MoviePlayer = await MoviePlayerPromise;
        MoviePlayer.appendChild(this.Element);
        return;
    }

    setMessageText(text){
        this.MessageTextElement.innerText = text;
        return;
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