import ChatBot from "./chatBot.js";
import Customer from "./customer.js";

const messagesContainer = document.querySelector("#messages");
const customerInputBox = document.querySelector("#input");
const subtmitButton = document.querySelector("#subtmitButton");

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    let chatBot;
    let customer;

    socket.emit("customer:get"); //gets existing customer

    socket.on("customer:create", () => {
      //creating session for new user
      let username;
      while (!username || !username.trim()) {
        username = prompt("Enter your username: ");
      }
      customer = new Customer(username);
      chatBot = new ChatBot(socket, customer, messagesContainer, customerInputBox, subtmitButton);
      chatBot.updateCustSession();
    });

    socket.on("customer:post", customerSession => {
        const customerObj = customerSession.customer;
        customer = Customer.createFromSession(customerObj)
        chatBot = new ChatBot(socket, customer, messagesContainer, customerInputBox, subtmitButton);
    })

})
