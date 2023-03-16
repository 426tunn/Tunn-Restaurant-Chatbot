const getCustomer = function () {
  socket = this
  const custSession = socket.request.session.custSession;
  if (!custSession) {
    return socket.emit("customer:create");
  } else {
    return socket.emit("customer:post", custSession);
  }
};

const updateCustSession = function (custSession) {
  const socket = this
    socket.request.session.custSession = custSession;
    socket.request.session.save();
}

module.exports = {
  getCustomer,
  updateCustSession
};
