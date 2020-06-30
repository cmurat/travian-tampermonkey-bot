'use strict';

const BuildingType = {
	EMPTY: 0,
	FOREST: 1,				//Oduncu
	CLAY: 2,				//Tugla Ocagi
	IRON: 3,				//Demir Madeni
	CROP: 4,				//Tarla
	LUMBER_MILL: 5, 		//Kereste Fabriaksi
	CLAY_OVEN: 6, 			//Tugla Firini
	FOUNDRY: 7, 			//Dokumhane
	GRAIN_MILL: 8, 			//Degirmen
	BAKERY: 9, 				//Ekmek Firini
    DEPOT: 10, 				//Hammadde deposu
    ARMORY: 13,				//Zirh Dokumhanesi
    LARGE_DEPOT: 38, 		//Buyuk Hammadde Deposu
    GRANARY: 11, 			//Tahil Deposu
    LARGE_GRANARY: 39, 		//Buyuk Tahil Deposu
    TOURNAMENT_AREA: 14, 	//Turnuva Yeri
    MILITRAY_BASE: 16,		//Askeri Us
    MARKET: 17,				//Pazar Yeri
    EMBASSY: 18,			//Elcilik
    BARRACKS: 19, 			//Kisla
    STABLE: 20, 			//Ahir
    SIEGE_WORKS: 21, 		//Tamirhane
    ACADEMY: 22, 			//Akademi
    CRANNY: 23,				//Siginak
    MUNICIPALITY: 24,		//Belediye
    TREASURY: 27,			//Hazine
    TRADE_CENTER: 28,		//Ticari Merkez
    MASONRY: 34,			//Tasci
    HERO_BARRACKS: 37,		//Kahraman Kislasi
    FEEDER: 41				//Yalak
}

const Pages = {
	RESOURCES: '/dorf1.php',
	CITY: '/dorf2.php',
	BUILDING_DETAIL: '/build.php'
}

const Action = {
	UPGRADE: '--UPGRADE'
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
		if(this.underConstruction) {
			this.level++;
		}
	}

	goToView() {
		window.location.href='build.php?id=' + this.locationId;
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
		window.location.href='build.php?id=' + this.locationId;
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
			this.level = buildElementClasses[1].replace("level","");
			this.upgradeButton = document.querySelector("#build > div.upgradeBuilding > div.upgradeButtonsContainer.section2Enabled > div.section1 > button");
		}
	}

	static getBuildingDetail() {
		let b = new BuildingDetail();
		if(b.type === BuildingType.EMPTY) {
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
		if(this.canUpgrade()) {
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