const Notification = require("../models/Notification");
const notificationDefinitions = require("../config/notificationDefinitions");

const createFromEvent = async ({
    kullaniciId,
    tip,
    data = {},
    link = null,
    metadata = null,
    transaction = null,
}) => {
    const definition = notificationDefinitions[tip];

    if (!definition) {
        throw new Error(`Tanımsız bildirim tipi: ${tip}`);
    }

    const mesaj =
        typeof definition.mesaj === "function"
            ? definition.mesaj(data)
            : definition.mesaj;

    return Notification.create(
        {
            kullanici_id: kullaniciId,
            tip,
            seviye: definition.seviye,
            konu: definition.konu,
            mesaj,
            link,
            metadata,
        },
        { transaction },
    );
};

module.exports = {
    createFromEvent,
};