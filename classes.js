'use strict';

const STORAGE_PREFIX = '--CM--';
const STORAGE_ACTION_LIST_VERSION = STORAGE_PREFIX + 'STORAGE_ACTION_LIST_VERSION';
const STORAGE_ACTION_LIST_INDEX = STORAGE_PREFIX + 'STORAGE_ACTION_LIST_INDEX';

class LocalStorageUtils {
    static set(key, value) {
        localStorage.setItem(key, value);
    }

    static getInt(key) {
        return parseInt(localStorage.getItem(key));

    }


}

class Configuration {
    static LOOP_MS = 1000;
    static REFRESH_LOOP_COUNT = 60;

    //When the action list changes, the version must be also changes
    //so that the bot will start from the desired action instead of the last executed action.
    static ACTION_LIST_VERSION = 1;
    static ACTION_LIST_START_INDEX = 0;
    static ACTION_LIST = []

    static SEND_HERO_ON_ADVENTURE_WHEN_AVAILABLE = true;

    //NOT ATOMIC!!!!
    static incrementAndSaveCurrentAction() {
        const currentActionIndex = Configuration.getCurrentActionListIndex();
        if (Configuration.getCurrentActionListVersion() !== Configuration.ACTION_LIST_VERSION
            || !!currentActionIndex) {
            LocalStorageUtils.set(STORAGE_ACTION_LIST_INDEX, Configuration.ACTION_LIST_START_INDEX);
        } else {
            LocalStorageUtils.set(STORAGE_ACTION_LIST_INDEX, currentActionIndex + 1);
        }
        LocalStorageUtils.set(STORAGE_ACTION_LIST_VERSION, Configuration.ACTION_LIST_VERSION);
    }

    static getCurrentActionListVersion() {
        return LocalStorageUtils.getInt(STORAGE_ACTION_LIST_VERSION);
    }

    static getCurrentActionListIndex() {
        return LocalStorageUtils.getInt(STORAGE_ACTION_LIST_INDEX);
    }
}
const BuildingType = {
    EMPTY: 0,
    FOREST: 1,              //Oduncu
    CLAY: 2,                //Tugla Ocagi
    IRON: 3,                //Demir Madeni
    CROP: 4,                //Tarla
    LUMBER_MILL: 5,         //Kereste Fabriaksi
    CLAY_OVEN: 6,           //Tugla Firini
    FOUNDRY: 7,             //Dokumhane
    GRAIN_MILL: 8,          //Degirmen
    BAKERY: 9,              //Ekmek Firini
    DEPOT: 10,              //Hammadde deposu
    ARMORY: 13,             //Zirh Dokumhanesi
    LARGE_DEPOT: 38,        //Buyuk Hammadde Deposu
    GRANARY: 11,            //Tahil Deposu
    LARGE_GRANARY: 39,      //Buyuk Tahil Deposu
    TOURNAMENT_AREA: 14,    //Turnuva Yeri
    MILITARY_BASE: 16,      //Askeri Us
    MARKET: 17,             //Pazar Yeri
    EMBASSY: 18,            //Elcilik
    BARRACKS: 19,           //Kisla
    STABLE: 20,             //Ahir
    SIEGE_WORKS: 21,        //Tamirhane
    ACADEMY: 22,            //Akademi
    CRANNY: 23,             //Siginak
    MUNICIPALITY: 24,       //Belediye
    TREASURY: 27,           //Hazine
    TRADE_CENTER: 28,       //Ticari Merkez
    MASONRY: 34,            //Tasci
    HERO_BARRACKS: 37,      //Kahraman Kislasi
    FEEDER: 41              //Yalak
}

const TroopType = {
    MIGRANT: [10, BuildingType.EMBASSY]
}

const Pages = {
    RESOURCES: '/dorf1.php',
    CITY: '/dorf2.php',
    BUILDING_DETAIL: '/build.php'
}

const ActionType = {
    UPGRADE: 'UPGRADE',
    TRAIN_TROOP: 'TRAIN_TROOP'
}

class Action {
    type;

    slot;
    buildingType;

    troopType;
    troopAmount;
    troopBuildingType;
    constructor(type, buildingType, slot, troopType, troopAmount, troopBuildingType) {
        this.type = type;

        this.buildingType = buildingType;
        this.slot = slot;

        this.troopType = troopType;
        this.troopAmount = troopAmount;
        this.troopBuildingType = troopBuildingType;
    }
}

class ResorceBuilding {
    locationId;
    element;
    type;
    level;
    underConstruction;

    constructor(locationId) {
        this.locationId = locationId
        this.element = document.getElementsByClassName('buildingSlot' + this.locationId)[0];

        var classList = this.element.classList;
        this.type = parseInt(classList[3].replace("gid", ""));
        this.level = parseInt(classList[classList.length - 1].replace("level", ""));
        this.underConstruction = classList.contains("underConstruction");
        if (this.underConstruction) {
            this.level++;
        }
    }

    goToView() {
        window.location.href = 'build.php?id=' + this.locationId;
    }

    canUpgrade() {
        var classList = this.element.classList;
        return !classList.contains("notNow")
            && !classList.contains("maxLevel");
    }
}

class DorfBuilding {
    locationId;
    slot;
    element;
    type;

    constructor(locationId) {
        this.locationId = locationId
        this.slot = 'a' + locationId;
        this.element = document.getElementsByClassName('buildingSlot ' + this.slot)[0];
        this.type = parseInt(this.element.classList[2].replace("g", ""));
    }

    goToView() {
        window.location.href = 'build.php?id=' + this.locationId;
    }

    canUpgrade() {
        var classList = this.element.children[0].classList;
        return !classList.contains("notNow")
            && !classList.contains("maxLevel");
    }

    isEmpty() {
        return this.type === BuildingType.EMPTY;
    }
}

class BuildingDetail {
    locationId;
    type;
    level;
    upgradeButton;

    constructor() {
        let buildElementClasses = document.getElementById("build").classList;
        this.type = parseInt(buildElementClasses[0].replace("gid", ""));
        this.locationId = parseInt(window.location.search.replace("?id=", ""));
        if (this.type !== 0) {
            this.level = buildElementClasses[1].replace("level", "");
            this.upgradeButton = document.querySelector("#build > div.upgradeBuilding > div.upgradeButtonsContainer.section2Enabled > div.section1 > button");
        }
    }

    static getBuildingDetail() {
        let b = new BuildingDetail();
        if (b.type === BuildingType.EMPTY) {
            return new EmptyBuildingDetail(b);
        }
        return b;
    }

    copy(buildingDetail) {
        this.type = buildingDetail.type;
        this.level = buildingDetail.level;
        this.upgradeButton = buildingDetail.upgradeButton;
        return this;
    }

    canUpgrade() {
        return !!this.upgradeButton && this.upgradeButton.classList[1] === "green";
    }

    upgrade() {
        if (this.canUpgrade()) {
            this.upgradeButton.click();
        }
    }

    isEmpty() {
        return this.type === BuildingType.EMPTY;
    }
}

class EmptyBuildingDetail extends BuildingDetail {
    constructor(buildingDetail) {
        super();
        super.copy(buildingDetail);
    }

    parentIdEquals(elementId, type) {
        let buildingElement = document.getElementById("contract_building" + type);
        return !!buildingElement && buildingElement.parentElement.parentElement.id === elementId;
    }

    //isEmpty or parentIdEquals should be checked before this. Otherwise the return value might be null
    getBuildButton(type) {
        return document.querySelector("#contract_building" + type + " > .contractLink > button")
    }

    canBuildNow(type) {
        return this.isEmpty && this.parentIdEquals("build", type) && this.getBuildButton(type).classList[1] === "green";
    }

    //Check if it is on the "soon" list or in "now" list but can't be build due to resources or full building queue
    canBuildSoon(type) {
        return this.isEmpty && (this.parentIdEquals("build_list_soon", type)
            || (this.parentIdEquals("build", type) && this.getBuildButton(type).classList[1] === "gold"));
    }

    build(type) {
        if (this.canBuildNow(type)) {
            getBuildButton(type).click()
        }
    }
}

class Villages {
    element;

    constructor() {
        this.element = document.querySelector("#sidebarBoxVillagelist > div.content > ul").children;
    }

    goToVillage(villageIndex) {
        this.element[villageIndex].firstElementChild.click();
    }

    getVillageName(villageIndex) {
        return this.element[villageIndex].querySelector("span > span").textContent;
    }

    getNumVillages() {
        return this.element.length;
    }
}