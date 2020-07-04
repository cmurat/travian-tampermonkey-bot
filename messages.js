
class MessageUtils {
    static recordResourceMessage(message) {
        LocalStorageUtils.set(STORAGE_SEND_RESOURCE_MESSAGE, JSON.stringify(message));
    }

    static getResourceMessage() {
        let messageStr = LocalStorageUtils.get(STORAGE_SEND_RESOURCE_MESSAGE);
        if (!!messageStr) {
            return JSON.parse(messageStr);
        }
    }

    static clearResourceMessage() {
        LocalStorageUtils.remove(STORAGE_SEND_RESOURCE_MESSAGE);
    }
}

class SendResourceMessage {
    //Village that will send the resources
    senderVillageIndex;

    //Village that will receive the resources
    receiverVillageIndex;

    wood;
    clay;
    iron;
    crop;

    constructor(senderVillageIndex, receiverVillageIndex, wood, clay, iron, crop) {
        this.senderVillageIndex = senderVillageIndex;
        this.receiverVillageIndex = receiverVillageIndex;
        this.wood = wood;
        this.clay = clay;
        this.iron = iron;
        this.crop = crop;
    }
}