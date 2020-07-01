(function() {
    'use strict';

    let loopCount = 0;
    let villages = new Villages();

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

    //DELETE THIS
    function handleResourceView() {
        function getBuildings() {
            let buildings = [];
            for (let i = RESOURCE_LOCATION_ID_START; i <= RESOURCE_LOCATION_ID_END; i++) {
                buildings.push(new ResourceBuilding(i));
            }
            return buildings;
        }

        let buildings = filterBuildingsByUpgradable(sortBuildingsByLevel(getBuildings()));
        let building = buildings[0];
        if (!!building) {
            localStorage.setItem(ActionType.UPGRADE, building.locationId);
            building.goToDetailView();
        }
    }

    //DELETE THIS
    function handleCityView() {
        function getBuildings() {
            let buildings = [];
            for (let i = CITY_LOCATION_ID_START; i <= CITY_LOCATION_ID_END; i++) {
                buildings.push(new DorfBuilding(i));
            }
            return buildings;
        }

    }

    function handleBuildingView() {
        let b = BuildingDetail.getBuildingDetail();

        if (parseInt(localStorage.getItem(ActionType.UPGRADE)) === b.locationId
            && b.canUpgrade()) {
            localStorage.removeItem(ActionType.UPGRADE);
            b.upgrade();
        }
    }

    function executeUpgradeActionInResourceView(action) {
        ViewUtils.goToPage(Pages.RESOURCES);
    }

    function executeUpgradeActionInCityView(action) {
        if (ViewUtils.getPagePathname() !== Pages.BUILDING_DETAIL) {
            ViewUtils.goToBuildingDetail(action.locationId);
        }

        let buildingDetail = BuildingDetail.getBuildingDetail();
        if (buildingDetail.isEmpty()
            && buildingDetail.canBuildNow(action.buildingType)) {
            buildingDetail.build(action.buildingType);
        } else {
            if (buildingDetail.level >= action.buildingLevel) {
                Configuration.incrementAndSaveCurrentAction();
                return;
            }
            if (buildingDetail.canUpgrade()) {
                buildingDetail.upgrade();
            }
        }
    }

    //No null checks for actions.
    function executeUpgradeAction(action) {
        let buildingType = action.buildingType;
        let locationId = action.locationId;

        let buildingInResourceView = DorfUtils.isBuildingInResourceView(buildingType);
        if (buildingInResourceView !== DorfUtils.isLocationIdInResourceView(locationId)) {
            console.warn("Skipping action. The building and the locationId are not in the same view. Action: " + action);
            Configuration.incrementAndSaveCurrentAction();
        }

        if (buildingInResourceView) {
            executeUpgradeActionInResourceView(action);
        } else {
            executeUpgradeActionInCityView(action);
        }
    }

    function executeCurrentAction() {
        let currentAction = Configuration.getCurrentAction();
        if (!!!currentAction) {
            return;
        }
        console.log("Executing action: " + currentAction);
        switch (currentAction.type) {
            case ActionType.UPGRADE:
                executeUpgradeAction(currentAction);
                break;
            default:
                console.log("Unknown action type: " + currentAction.type);
        }
    }

    function main() {
        // debugger;
        //Skip the first loop so that configuration changes take effect.
        if (loopCount !== 0) {
            executeCurrentAction();

            if (loopCount > Configuration.REFRESH_LOOP_COUNT) {
                window.location.reload();
            }
        }
        loopCount++;
        setTimeout(main, Configuration.LOOP_MS);
    }

    Configuration.ACTION_LIST_VERSION = 2
    Configuration.ACTION_LIST.push(
        new Action(ActionType.UPGRADE, 32, BuildingType.MANSION, 10));

    main();
    // Your code here...
})();



/*
<tr>
                            <td class="typ">
                                <a href="build.php?gid=16&amp;tt=1#at"><img class="att1" src="img/x.gif"></a>                            </td>
                            <td>
                                <div class="mov">
                                    <span class="a1">2 Saldırılar</span>                                </div>
                                <div class="dur_r">
                                    zamanı <span class="timer" counting="down" value="4469">1:14:29</span> sürer,                                </div>
                            </td>
                        </tr>
*/