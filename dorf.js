'use strict';

class DorfUtils {
    static isLocationIdInResourceView(locationId) {
        return RESOURCE_LOCATION_ID_START <= locationId && locationId <= RESOURCE_LOCATION_ID_END;
    }

    static isLocationIdInCityView(locationId) {
        return CITY_LOCATION_ID_START <= locationId && locationId <= CITY_LOCATION_ID_END;
    }

    static isBuildingInResourceView(buildingType) {
        return [BuildingType.CROP, BuildingType.CLAY, BuildingType.FOREST, BuildingType.IRON]
            .includes(buildingType);
    }

    static getResourceBuildings() {
        let buildings = [];
        for (let i = RESOURCE_LOCATION_ID_START; i <= RESOURCE_LOCATION_ID_END; i++) {
            buildings.push(new ResourceBuilding(i));
        }
        return buildings;
    }

    static getDorfBuildings() {
        let buildings = [];
        for (let i = CITY_LOCATION_ID_START; i <= CITY_LOCATION_ID_END; i++) {
            buildings.push(new DorfBuilding(i));
        }
        return buildings;
    }

    //For both Dorf buildings
    static sortBuildingsByLevel(buildings) {
        buildings.sort(
            function (b1, b2) {
                return b1.level - b2.level;
            });
        return buildings;
    }

    //For both Dorf buildings
    static filterBuildingsByUpgradable(buildings) {
        return buildings.filter(function (b) {
            return b.canUpgrade();
        });
    }

    //For both Dorf buildings
    static getBuildingsByType(type, buildings) {
        return buildings.filter(function (building) {
            return building.type === type;
        });
    }
}

class ResourceBuilding {
    locationId;
    element;
    type;
    level;
    underConstruction;

    constructor(locationId) {
        this.locationId = locationId
        this.element = document.getElementsByClassName('buildingSlot' + this.locationId)[0];

        let classList = this.element.classList;
        this.type = parseInt(classList[3].replace("gid", ""));
        this.level = parseInt(classList[classList.length - 1].replace("level", ""));
        this.underConstruction = classList.contains("underConstruction");
        if (this.underConstruction) {
            this.level++;
        }
    }

    goToDetailView() {
        return ViewUtils.checkAndGoToBuildingDetail(this.locationId);
    }

    canUpgradeSoon() {
        let classList = this.element.classList;
        return classList.contains("notNow");
    }

    isMaxLevel() {
        let classList = this.element.classList;
        return classList.contains("maxLevel");
    }

    canUpgrade() {
        return !this.canUpgradeSoon() && !this.isMaxLevel();
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

    goToDetailView() {
        return ViewUtils.checkAndGoToBuildingDetail(this.locationId);
    }

    canUpgradeSoon() {
        let classList = this.element.children[0].classList;
        return classList.contains("notNow");
    }

    isMaxLevel() {
        let classList = this.element.children[0].classList;
        return classList.contains("maxLevel");
    }

    canUpgrade() {
        return !this.canUpgradeSoon() && !this.isMaxLevel();
    }

    isEmpty() {
        return this.type === BuildingType.EMPTY;
    }

    getLevel() {
        return parseInt(this.element.querySelector(".labelLayer").textContent);
    }
}

class BuildingDetail {
    locationId;
    type;
    level;
    upgradeButton;

    //Don't use this, use the #getBuildingDetail method.
    constructor() {
        let buildElementClasses = document.getElementById("build").classList;
        this.type = parseInt(buildElementClasses[0].replace("gid", ""));
        this.locationId = parseInt(window.location.search.replace("?id=", ""));
        if (this.type !== 0) {
            this.level = buildElementClasses[1].replace("level", "");
            this.upgradeButton = document.querySelector("#build > div.upgradeBuilding > div.upgradeButtonsContainer button");
        }
    }

    static getBuildingDetail() {
        let b = new BuildingDetail();
        if (b.type === BuildingType.EMPTY) {
            return new EmptyBuildingDetail(b);
        } else if (b.type === BuildingType.MARKET) {
            return new MarketBuildingDetail(b);
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

    getNextLevel() {
        return parseInt(this.upgradeButton.textContent.trim().replace("Bu seviyeye geliştir: ", ""));
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
            this.getBuildButton(type).click()
        }
    }
}

class MarketBuildingDetail extends BuildingDetail {
    static RESOURCE_SEND_FAVOR_INDEX = 1;

    favorList;

    constructor(buildingDetail) {
        super();
        super.copy(buildingDetail);

        this.favorList = document.querySelectorAll("#content > div.contentNavi.subNavi.tabFavorWrapper > div > div");
    }

    getActiveFavorIndex() {
        for (let i = 0; i < this.favorList.length; i++) {
            if (this.favorList[i].firstElementChild.classList.contains("active")) {
                return i;
            }
        }
    }

    checkAndSwitchToResourceSendFavor() {
        if (this.getActiveFavorIndex() !== MarketBuildingDetail.RESOURCE_SEND_FAVOR_INDEX) {
            this.favorList[MarketBuildingDetail.RESOURCE_SEND_FAVOR_INDEX].firstElementChild.click();
            return true;
        }

        return false;
    }

    getMerchantCapacity() {
        return parseInt(document.querySelector("#merchantCapacityValue").textContent);
    }

    getMerchantRoundTripSeconds() {
        let hour = document.querySelector("#target_validate > tbody > tr:nth-child(4) > td").textContent;
        let seconds = ViewUtils.parseHourToSeconds(hour);
        return seconds * 2;
    }

    isOnSendResourceConfirmationPage() {
        let button = document.querySelector("#enabledButton");
        return !!button && !button.classList.contains("prepare");
    }

    //Extract logic from here
    sendResource(wood, clay, iron, crop, villageName) {
        let button = document.querySelector("#enabledButton");
        if (!this.isOnSendResourceConfirmationPage()) {
            document.querySelector("#r1").value = wood;
            document.querySelector("#r2").value = clay;
            document.querySelector("#r3").value = iron;
            document.querySelector("#r4").value = crop;
            document.querySelector("#enterVillageName").value = villageName;

            button.click();
        } else {
            button.click();
        }

    }
}