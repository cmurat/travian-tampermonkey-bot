// ==UserScript==
// @name         Travian Legends Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.travian.com.tr/*
// @grant        none
// @require      /Users/cmurat/Documents/workspace/travian-bot/travian-bot.js
// ==/UserScript==

(function() {
    'use strict';

    const BuildingType = {
    	EMPTY: 0,
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

	class DorfBuilding {
		id;
		slot;
		element;
		type;
		constructor(id) {
			this.id = id
			this.slot = 'a' + id;
			this.element = document.getElementsByClassName('buildingSlot ' + this.slot)[0];
			this.type = parseInt(this.element.classList[2].replace("g", ""));
		}

		goToView() {
			window.location.href='build.php?id=' + this.id;
		}

		canUpgrade() {
			return this.element.children[0].classList[2] !== "notNow"
				&& this.element.children[0].classList[2] !== "maxLevel"
		}

		isEmpty() {
			return this.type === BuildingType.EMPTY;
		}
	}

	class BuildingDetail {
		type;
		level;
		upgradeButton;
		constructor() {
			let buildElementClasses = document.getElementById("build").classList;
			this.type = parseInt(buildElementClasses[0].replace("gid", ""));

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

		parentIdEquals(id, type) {
			let buildingElement = document.getElementById("contract_building" + type);
			return !!buildingElement && buildingElement.parentElement.parentElement.id === id;
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








	function handleCityView() {
	    // console.log(new DorfBuilding(20).canUpgrade());
	    // console.log(new DorfBuilding(19).canUpgrade());
	    // console.log(new DorfBuilding(29).canUpgrade());
	}

	function handleBuildingView() {
	    let b = BuildingDetail.getBuildingDetail();

	    // console.log(b.type);
	    // console.log(b.level);
	    // console.log(b.upgradeButton);
	    // console.log(b.canUpgrade());
	    // console.log(b.isEmpty());
	    console.log(b.canBuildNow(BuildingType.TREASURY))
	    // console.log(b.build(BuildingType.CRANNY))
	}
    







    //Main
	switch (window.location.pathname) {
		case '/dorf2.php':
			handleCityView();
			break;
		case '/build.php':
			handleBuildingView();
			break;
		default:
			console.warn("Unknown view");
			break;
	}
	
    // Your code here...
})();



/*
<tr>
							<td class="typ">
								<a href="build.php?gid=16&amp;tt=1#at"><img class="att1" src="img/x.gif"></a>							</td>
							<td>
								<div class="mov">
									<span class="a1">2 Saldırılar</span>								</div>
								<div class="dur_r">
									zamanı <span class="timer" counting="down" value="4469">1:14:29</span> sürer,								</div>
							</td>
						</tr>
*/