/*

MAKE A FUNC TO REDRAW SETTINGS BASED OFF THEIR PREREQS

Temporarily allow editing settings even when other block them from being used

*/

//- Main

async function main(){

    await getDefaultSettings();

    loadKeyElements();
    setListeners();

    await loadStoredSettings();

    createElements();

    return;

} main();

// GROUP Elements

function loadKeyElements(){
    DebugButton = document.getElementById("Debug");
    MasterToggleButton = document.getElementById("MasterSwitch-Toggle");
    SettingsDiv = document.getElementById("Settings");
}

function createElements(){
    for (const key of Object.keys(Settings)){
        let setting = Settings[key];
        if (setting.id != "MasterSwitch"){
            let settingElement = generateSettingElement(setting);
            SettingsDiv.appendChild(settingElement);
        }
        else{
            MasterToggleButton.dataset.state = setting.selected_value;
        }

    }
}

function redraw(id){
    console.log(`redraw triggered on element ${id}`);
}

function generateSettingElement(setting){

    let div = document.createElement("div");
    div.className = "Setting";
    div.id = setting.id;

    let text = document.createElement("div");

    let title = document.createElement("p");
    title.innerText = setting.displayname;

    text.appendChild(title);

    let description = document.createElement("p");
    description.innerText = setting.description;

    text.appendChild(description);

    div.appendChild(text);

    // DROPDOWN

    if (setting.optiontype == "Dropdown"){

        let dropdown = document.createElement("select");
        dropdown.id = setting.id;
    
        let values = setting.accepted_values;
        let presetindex = 0;
        for (let index = 0; index<values.length; index++){

            if (values[index] == setting.selected_value){
                presetindex = index;
            }

            let option = document.createElement("option");
            option.value = values[index];
            option.innerText = values[index];
            dropdown.appendChild(option);
        }

        dropdown.selectedIndex = presetindex;

        dropdown.onchange = function(){
            modifySetting(setting.id,dropdown.value);
        }
    
        div.appendChild(dropdown);

    }

    // TOGGLE

    else if (setting.optiontype == "Toggle"){
        
        let toggle = document.createElement("button");
        toggle.className = "Toggle";
        toggle.dataset.state = `${setting.selected_value}`;

        let toggleball = document.createElement("div");
        toggleball.className = "ToggleBall";
        toggle.appendChild(toggleball);

        toggle.onclick = function(){
            let state = toggle.dataset.state;
            if (state == "false"){
                toggle.dataset.state = "true";
                modifySetting(setting.id,true);
            }else{
                toggle.dataset.state = "false";
                modifySetting(setting.id,false);
            }
        }

        div.appendChild(toggle);

    }

    return div;

}

// GROUP Listeners
function setListeners(){

    if (DebugButton){
            DebugButton.addEventListener("click",function(){
            debug();
        });
    }

    MasterToggleButton.addEventListener("click",function(){
        let state = MasterToggleButton.dataset.state;
        if (state == "false"){
            MasterToggleButton.dataset.state = "true";
        }else{
            MasterToggleButton.dataset.state = "false";
        }
    });
}
