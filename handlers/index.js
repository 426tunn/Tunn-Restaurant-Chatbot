const { getCustomer, updateCustSession } = require("./customer");

const connecting = (socket) => {
    socket.on("customer:get", getCustomer);
    socket.on("customer:update-session", updateCustSession)

}

module.exports =  connecting;