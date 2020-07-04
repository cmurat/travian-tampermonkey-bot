(function() {
    'use strict';

    let loopCount = 0;
    let villages = new Villages();

    function hasResourceMessage() {
        return !!MessageUtils.getResourceMessage();
    }

    function executeResourceMessage() {
        let message = MessageUtils.getResourceMessage();
        if (villages.getCurrentVillageIndex() !== message.senderVillageIndex) {
            villages.goToVillage(message.senderVillageIndex);
        } else {
            let marketDetails;
            try {
                marketDetails = BuildingDetail.getBuildingDetail();
            } catch (ignored) {}

            if (!!!marketDetails) {
                if (ViewUtils.checkAndGoToPage(Pages.CITY)) {
                    return;
                }

                let market = DorfUtils.getBuildingsByType(BuildingType.MARKET, DorfUtils.getDorfBuildings())[0];
                if (ViewUtils.checkAndGoToBuildingDetail(market.locationId)) {
                    return;
                }
            }

            if (marketDetails.checkAndSwitchToResourceSendFavor()) {
                return;
            }

            let requestedWood = 0;
            let requestedClay = 0;
            let requestedIron = 0;
            let requestedCrop = 0;
            let totalRequestedResource = 0;
            let merchantCapacity = marketDetails.getMerchantCapacity();

            if (merchantCapacity === 0) {
                return;
            }

            if (totalRequestedResource + message.wood <= merchantCapacity) {
                totalRequestedResource = totalRequestedResource + message.wood;
                requestedWood = message.wood;
            } else {
                requestedWood = merchantCapacity - totalRequestedResource;
                totalRequestedResource = merchantCapacity;
            }

            if (totalRequestedResource + message.clay <= merchantCapacity) {
                totalRequestedResource = totalRequestedResource + message.clay;
                requestedClay = message.clay;
            } else {
                requestedClay = merchantCapacity - totalRequestedResource;
                totalRequestedResource = merchantCapacity;
            }

            if (totalRequestedResource + message.iron <= merchantCapacity) {
                totalRequestedResource = totalRequestedResource + message.iron;
                requestedIron = message.iron;
            } else {
                requestedIron = merchantCapacity - totalRequestedResource;
                totalRequestedResource = merchantCapacity;
            }

            if (totalRequestedResource + message.crop <= merchantCapacity) {
                totalRequestedResource = totalRequestedResource + message.crop;
                requestedCrop = message.crop;
            } else {
                requestedCrop = merchantCapacity - totalRequestedResource;
                totalRequestedResource = merchantCapacity;
            }

            if (marketDetails.isOnSendResourceConfirmationPage()) {
                if (totalRequestedResource === (message.wood + message.clay + message.iron + message.crop)) {
                    MessageUtils.clearResourceMessage();
                } else {
                    let newMessage = new SendResourceMessage(
                        message.senderVillageIndex,
                        message.receiverVillageIndex,
                        message.wood - requestedWood,
                        message.clay - requestedClay,
                        message.iron - requestedIron,
                        message.crop - requestedCrop,
                    );

                    MessageUtils.recordResourceMessage(newMessage);
                }

                let merchantTimeout = UIUtils.getServerTime() + marketDetails.getMerchantRoundTripSeconds() + 90;
                LocalStorageUtils.set(STORAGE_SEND_RESOURCE_MESSAGE_TIMEOUT, merchantTimeout)
            }

            marketDetails.sendResource(
                requestedWood, requestedClay, requestedIron, requestedCrop,
                villages.getVillageName(message.receiverVillageIndex));
        }
    }

    function executeCurrentAction() {
        let currentAction = Configuration.getCurrentAction();
        if (!!!currentAction) {
            return;
        }
        console.log("Executing action: " + currentAction);
        if (currentAction.villageIndex !== villages.getCurrentVillageIndex()) {
            villages.goToVillage(currentAction.villageIndex);
            return;
        }
        switch (currentAction.type) {
            case ActionType.UPGRADE:
                executeUpgradeAction(currentAction);
                break;
            case ActionType.CONTINUOUS_RESOURCE_UPGRADE:
                executeContinuousResourceUpgrade(currentAction);
                break;
            default:
                console.log("Unknown action type: " + currentAction.type);
        }
    }

    function main() {
        // debugger;
        //Skip the first loop so that configuration changes take effect.
        if (loopCount !== 0) {
            //Messages take priority
            if (hasResourceMessage()) {
                executeResourceMessage();
            } else {
                executeCurrentAction();
            }

            if (loopCount > Configuration.REFRESH_LOOP_COUNT) {
                ViewUtils.reload();
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
                                <a href="build.php?gid=16&amp;tt=1#at"><img class="att1" src="img/x.gif"></a>                            </td>
                            <td>
                                <div class="mov">
                                    <span class="a1">2 Saldırılar</span>                                </div>
                                <div class="dur_r">
                                    zamanı <span class="timer" counting="down" value="4469">1:14:29</span> sürer,                                </div>
                            </td>
                        </tr>
*/