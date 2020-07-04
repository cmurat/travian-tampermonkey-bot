'use strict';

//Validates and delegates the action.
function executeUpgradeAction(action) {
    validateUpgradeAction(action);

    let buildingInResourceView = DorfUtils.isBuildingInResourceView(action.buildingType);
    if (buildingInResourceView) {
        executeUpgradeActionInResourceView(action);
    } else {
        executeUpgradeActionInCityView(action);
    }
}

function validateUpgradeAction(action) {
    if (!!!action || isNaN(action.villageIndex) || isNaN(action.buildingType)
        || isNaN(action.locationId) || isNaN(action.buildingLevel)) {
        console.warn("Skipping action. At least one required field is empty. Action index: " + Configuration.getCurrentActionListIndex());
        Configuration.incrementAndSaveCurrentAction();
        return;
    }

    let buildingInResourceView = DorfUtils.isBuildingInResourceView(action.buildingType);
    let locationId = action.locationId;
    if (buildingInResourceView !== DorfUtils.isLocationIdInResourceView(locationId)) {
        console.warn("Skipping action. The building and the locationId are not in the same view. Action index: " + Configuration.getCurrentActionListIndex());
        Configuration.incrementAndSaveCurrentAction();
        return;
    }
}

//The action is assumed to be valid.
function executeUpgradeActionInResourceView(action) {
    if (ViewUtils.checkAndGoToPage(Pages.RESOURCES)) {
        return;
    }
}

//The action is assumed to be valid.
function executeUpgradeActionInCityView(action) {
    if (!Configuration.isCurrentActionAvailable()) {
        if (ViewUtils.checkAndGoToPage(Pages.CITY)) {
            return;
        }

        let building = new DorfBuilding(action.locationId);
        if (building.isEmpty()) {
            console.log("The slot is empty. Cannot upgrade, skipping index: "
                + Configuration.getCurrentActionListIndex());

            Configuration.incrementAndSaveCurrentAction();
            ViewUtils.reload();
        }

        if (building.getLevel() >= action.buildingLevel) {
            console.log("The action is done. Index: "
                + Configuration.getCurrentActionListIndex());

            Configuration.incrementAndSaveCurrentAction();
            ViewUtils.reload();
        }

        if (building.isMaxLevel()) {
            console.log("The building is max level. Cannot upgrade, skipping index: "
                + Configuration.getCurrentActionListIndex());

            Configuration.incrementAndSaveCurrentAction();
            ViewUtils.reload();
        }

        if (building.canUpgrade()) {
            Configuration.setCurrentActionAvailable(true);
            building.goToDetailView();
        }

        if (Configuration.RESOURCE_VILLAGE_INDEX > -1
            && building.canUpgradeSoon() && UIUtils.getNumberOfConstructions() < 2) {
            sendContinuousResourceUpgradeResourceMessage(action);
        }

        return;
    }

    if (ViewUtils.checkAndGoToBuildingDetail(action.locationId)) {
        return;
    }

    let buildingDetail = BuildingDetail.getBuildingDetail();
    if (buildingDetail.level >= action.buildingLevel
        || buildingDetail.getNextLevel() > action.buildingLevel) {
        console.log("The action is done. Index: " + Configuration.getCurrentActionListIndex());
        Configuration.incrementAndSaveCurrentAction();
        return;
    }
    if (buildingDetail.canUpgrade()) {
        buildingDetail.upgrade();
    } else {
        Configuration.setCurrentActionAvailable(false);
    }
}


