function executeContinuousResourceUpgrade(action) {
    validateContinuousResourceUpgradeAction(action);
    if (isNaN(LocalStorageUtils.getInt(STORAGE_CONTINUOUS_UPGRADE_NEXT_BUILDING_LOCATION_ID))) {
        if (ViewUtils.checkAndGoToPage(Pages.RESOURCES)) {
            return;
        }

        let buildings = DorfUtils.sortBuildingsByLevel(DorfUtils.getResourceBuildings());
        for (let i = 0; i < buildings.length; i++) {
            if (buildings[i].level >= action.buildingLevel) {
                buildings.splice(i, buildings.length - i);
                break;
            }
        }

        if (buildings.length === 0) {
            console.log("Continuous upgrade done. Index: " + Configuration.getCurrentActionListIndex());
            Configuration.incrementAndSaveCurrentAction();
        }

        let buildingsAvailableForUpgrade = buildings.filter(
            function (building) {
                return !building.underConstruction && building.canUpgrade();
            }
        )
        let building = buildingsAvailableForUpgrade[0];
        if (!!building) {
            LocalStorageUtils.set(STORAGE_CONTINUOUS_UPGRADE_NEXT_BUILDING_LOCATION_ID, building.locationId);
            building.goToDetailView();
        } else if(Configuration.RESOURCE_VILLAGE_INDEX > -1
            && !!buildings[0] && !buildings[0].isMaxLevel() && UIUtils.getNumberOfConstructions() < 2) {
            sendContinuousResourceUpgradeResourceMessage(action);
        }
    } else {
        let buildingDetail = BuildingDetail.getBuildingDetail();
        if (buildingDetail.canUpgrade()) {
            LocalStorageUtils.remove(STORAGE_CONTINUOUS_UPGRADE_NEXT_BUILDING_LOCATION_ID);
            buildingDetail.upgrade();
        }
    }
}

function validateContinuousResourceUpgradeAction(action) {

    if (!!!action || isNaN(action.villageIndex) || isNaN(action.buildingLevel)) {
        console.warn("Skipping action. At least one required field is empty. Action index: " + Configuration.getCurrentActionListIndex());
        Configuration.incrementAndSaveCurrentAction();
        return;
    }
}

function sendContinuousResourceUpgradeResourceMessage(action) {
    if (LocalStorageUtils.getInt(STORAGE_SEND_RESOURCE_MESSAGE_TIMEOUT) > UIUtils.getServerTime()) {
        return;
    }
    debugger;
    let depotLimit = UIUtils.getResourceDepotLimit();
    let granaryLimit = UIUtils.getGranaryLimit();

    let message = new SendResourceMessage(
        Configuration.RESOURCE_VILLAGE_INDEX,
        action.villageIndex,
        depotLimit - UIUtils.getWoodInStorage(),
        depotLimit - UIUtils.getClayInStorage(),
        depotLimit - UIUtils.getIronInStorage(),
        granaryLimit - UIUtils.getCropInStorage(),
    );

    MessageUtils.recordResourceMessage(message);
}