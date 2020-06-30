(function() {
    'use strict';

    //For both Dorf buildings
	function sortBuildingsByLevel(buildings) {
		buildings.sort(
			function(b1, b2) {
				return b1.level - b2.level;
		});
		return buildings;
	}

	//For both Dorf buildings
	function filterBuildingsByUpgradable(buildings) {
		return buildings.filter(function(b){return b.canUpgrade();});
	}

	//For both Dorf buildings
	function getBuildingsByType(type, buildings) {
		return buildings.filter(function(building) {return building.type === type;});
	}

	function handleResouceView() {
		function getBuildings() {
			var buildings = [];
			//Building slots for the city view is between 1 and 18, inclusive.
			for (var i = 1; i <= 18; i++) {
				buildings.push(new ResorceBuilding(i));
			}
			return buildings;
		}

		var buildings = filterBuildingsByUpgradable(sortBuildingsByLevel(getBuildings()));
		var building = buildings[0];
		if (!!building) {
			localStorage.setItem(Action.UPGRADE, building.locationId);
			building.goToView();
		}
	}

	function handleCityView() {
		function getBuildings() {
			var buildings = [];
			//Building slots for the city view is between 19 and 39, inclusive.
			for (var i = 19; i <= 39; i++) {
				buildings.push(new DorfBuilding(i));
			}
			return buildings;
		}

	}

	function handleBuildingView() {
	    let b = BuildingDetail.getBuildingDetail();

	    if (parseInt(localStorage.getItem(Action.UPGRADE)) === b.locationId &&  b.canUpgrade()) {
	    	localStorage.removeItem(Action.UPGRADE);
	    	b.upgrade();
	    }
	}

	//Main control loop.
	var loopCount = 0;
	var villages = new Villages();
	function main() {
		//Skip the first loop so that configuration changes take effect.
		if (loopCount !== 0) {
			switch (window.location.pathname) {
				case Pages.RESOURCES:
					handleResouceView();
					break;
				case Pages.CITY:
					handleCityView();
					break;
				case Pages.BUILDING_DETAIL:
					handleBuildingView();
					break;
				default:
					console.warn("Unknown view");
					break;
			}

			if (loopCount > Configuration.REFRESH_LOOP_COUNT) {
				window.location.reload();
			}
		}
		loopCount++;
		setTimeout(main, Configuration.LOOP_MS);
	}

	main();
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