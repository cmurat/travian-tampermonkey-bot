'use strict';

const RESOURCE_LOCATION_ID_START = 1;
const RESOURCE_LOCATION_ID_END = 18;
const CITY_LOCATION_ID_START = 19;
const CITY_LOCATION_ID_END = 39;

const STORAGE_PREFIX = '--CM--';
const STORAGE_ACTION_LIST_VERSION = STORAGE_PREFIX + 'STORAGE_ACTION_LIST_VERSION';
const STORAGE_ACTION_LIST_INDEX = STORAGE_PREFIX + 'STORAGE_ACTION_LIST_INDEX';
const STORAGE_CURRENT_ACTION_AVAILABLE = STORAGE_PREFIX + 'STORAGE_CURRENT_ACTION_AVAILABLE';
const STORAGE_CONTINUOUS_UPGRADE_NEXT_BUILDING_LOCATION_ID = STORAGE_PREFIX + 'STORAGE_CONTINUOUS_UPGRADE_NEXT_BUILDING_LOCATION_ID';
const STORAGE_SEND_RESOURCE_MESSAGE = STORAGE_PREFIX + 'STORAGE_SEND_RESOURCE_MESSAGE';
const STORAGE_SEND_RESOURCE_MESSAGE_TIMEOUT = STORAGE_PREFIX + 'STORAGE_SEND_RESOURCE_MESSAGE_TIMEOUT';

class Configuration {
    static LOOP_MS = 1000;
    static REFRESH_LOOP_COUNT = 60;
    static RESOURCE_VILLAGE_INDEX = -1;

    //When the action list changes, the version must be also changes
    //so that the bot will start from the desired action instead of the last executed action.
    static ACTION_LIST_VERSION = 1;
    static ACTION_LIST_START_INDEX = 0;
    static ACTION_LIST = [];

    static SEND_HERO_ON_ADVENTURE_WHEN_AVAILABLE = true;

    static getCurrentActionListVersion() {
        return LocalStorageUtils.getInt(STORAGE_ACTION_LIST_VERSION);
    }

    static resetActionList() {
        LocalStorageUtils.set(STORAGE_ACTION_LIST_INDEX, Configuration.ACTION_LIST_START_INDEX);
        LocalStorageUtils.set(STORAGE_ACTION_LIST_VERSION, Configuration.ACTION_LIST_VERSION);
    }

    static verifyAndSetVersion() {
        if (Configuration.getCurrentActionListVersion() !== Configuration.ACTION_LIST_VERSION) {
            Configuration.resetActionList();
        }
    }

    static incrementAndSaveCurrentAction() {
        Configuration.verifyAndSetVersion();
        LocalStorageUtils.remove(STORAGE_CURRENT_ACTION_AVAILABLE);
        LocalStorageUtils.set(STORAGE_ACTION_LIST_INDEX, Configuration.getCurrentActionListIndex() + 1);
    }

    static getCurrentActionListIndex() {
        Configuration.verifyAndSetVersion();
        if (isNaN(LocalStorageUtils.getInt(STORAGE_ACTION_LIST_INDEX))) {
            Configuration.resetActionList();
        }
        return LocalStorageUtils.getInt(STORAGE_ACTION_LIST_INDEX);
    }

    static getCurrentAction() {
        return Configuration.ACTION_LIST[Configuration.getCurrentActionListIndex()]
    }

    static isCurrentActionAvailable() {
        return LocalStorageUtils.getBoolean(STORAGE_CURRENT_ACTION_AVAILABLE);
    }

    static setCurrentActionAvailable(currentActionAvailable) {
        LocalStorageUtils.set(STORAGE_CURRENT_ACTION_AVAILABLE, currentActionAvailable);
    }
}

class ViewUtils {
    static getPagePathname() {
        return window.location.pathname;
    }

    static changeView(href) {
        window.location.href = href;
    }

    static checkAndGoToBuildingDetail(locationId) {
        if (ViewUtils.getPagePathname() !== Pages.BUILDING_DETAIL
            || BuildingDetail.getBuildingDetail().locationId !== locationId) {
                ViewUtils.changeView('build.php?id=' + locationId);
            return true;
        }
        return false;
    }

    static checkAndGoToPage(page) {
        if (ViewUtils.getPagePathname() !== page) {
            ViewUtils.changeView(page);
            return true;
        }
        return false;
    }

    static reload() {
        window.location.reload();
    }

    static parseHourToSeconds(hour) {
        let hourParts = hour.split(':');
        return (+hourParts[0]) * 60 * 60 + (+hourParts[1]) * 60 + (+hourParts[2]);
    }
}

class LocalStorageUtils {
    static set(key, value) {
        localStorage.setItem(key, value);
    }

    static get(key) {
        return localStorage.getItem(key)
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static getInt(key) {
        return parseInt(localStorage.getItem(key));
    }

    static getBoolean(key) {
        return localStorage.getItem(key) === 'true';
    }
}

class UIUtils {
    static getResourceDepotLimit() {
        return parseInt(document
            .querySelector("#stockBar > div.warehouse > div > div")
            .textContent.replace(/\D/g,''));
    }

    static getGranaryLimit() {
        return parseInt(document
            .querySelector("#stockBar > div.granary > div > div")
            .textContent.replace(/\D/g,''));
    }

    static getWoodInStorage() {
        return parseInt(document.querySelector("#l1").textContent.replace(".", ""));
    }

    static getClayInStorage() {
        return parseInt(document.querySelector("#l2").textContent.replace(".", ""));
    }

    static getIronInStorage() {
        return parseInt(document.querySelector("#l3").textContent.replace(".", ""));
    }

    static getCropInStorage() {
        return parseInt(document.querySelector("#l4").textContent.replace(".", ""));
    }

    static getNumberOfConstructions() {
        let constructionListElement = document.querySelector("#content > div.boxes.buildingList > div.boxes-contents.cf ul");
        if (!!!constructionListElement) {
            return 0;
        } else {
            return constructionListElement.children.length;
        }
    }

    static getServerTime() {
        return parseInt(
            document.querySelector("#servertime > span").getAttribute("value"));
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
    MANSION: 25,            //Kosk
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
    CONTINUOUS_RESOURCE_UPGRADE: 'CONTINUOUS_RESOURCE_UPGRADE',
    UPGRADE: 'UPGRADE',
    BUILD: 'BUILD',
    TRAIN_TROOP: 'TRAIN_TROOP',
}

class Action {
    type;

    villageIndex;

    locationId;
    buildingType;
    buildingLevel;

    troopType;
    troopAmount;
    troopBuildingType;
    constructor(type, villageIndex, locationId, buildingType, buildingLevel, troopType, troopAmount, troopBuildingType) {
        this.type = type;

        this.villageIndex = villageIndex;

        this.buildingType = buildingType;
        this.buildingLevel = buildingLevel;
        this.locationId = locationId;

        this.troopType = troopType;
        this.troopAmount = troopAmount;
        this.troopBuildingType = troopBuildingType;
    }
}

class Villages {
    element;

    constructor() {
        this.element = document.querySelector("#sidebarBoxVillagelist > div.content > ul").children;
    }

    getCurrentVillageIndex() {
        for (let i = 0; i < this.element.length; i++) {
            if (this.element[i].classList.contains("active")) {
                return i;
            }
        }
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