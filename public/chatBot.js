import OrderItem from "./orderItem.js";

class ChatBot {
    commands = {
        1: "Place an Order",
        97: "See current order",
        98: "See order history",
        99: "Checkout order",
        0: "Cancel Order"
    }
    states = {
        0: "Select Option",
        1: "Select OrderItem",
        2: "Type Quantity",
        3: "Confirm Other"
    }
    confirmOrCancel = {
        0: "cancel",
        1: "confirm",
    }
    constructor(socket, user, messages, customerInput, subtmitButton) {
        this.socket = socket;
        this.state = this.states[0];
        this.customer = user;
        this.messages = messages;
        this.customerInput = customerInput;
        this.subtmitButton = subtmitButton;
        this.orderItems = null;
        this.currentOrderItem = null;

        this.chatOptions = this.commands;
        this.validOptions = null;

        this.DisplayMessage(`Welcome ${this.customer.name}`);
        this.showChatOptions();

        subtmitButton.addEventListener('click', (e) => {
           e.preventDefault();
           const customerInput = this.getcustomerInput();
           if (!this.validate(customerInput)) return;
            this.clearcustomerInput();
           // if we're waiting for user to pick an option
           if (this.state === this.states[0]) {
               this.sendMessage({message: customerInput, user: true })
               this.processInput(parseInt(customerInput));
           } else if (this.state === this.states[1]) {
                const pickedItem = this.orderItems[customerInput];
                this.sendMessage({
                    message: `You want: ${pickedItem[0]}`,
                    user: true
                })
                this.currentOrderItem = new OrderItem(pickedItem[0], pickedItem[1]);
                this.state = this.states[2];
                this.sendMessage({message: "In what quantity: "})
           } else if (this.state === this.states[2]) {
                this.currentOrderItem.quantity = customerInput;
                this.sendMessage({message: customerInput, user: true});
                this.state = this.states[3]
                this.chatOptions = this.confirmOrCancel;
                this.showChatOptions();
           } else if (this.state === this.states[3]) {
               const confirmed = this.confirmOrderPlacement(this.confirmOrCancel[customerInput]);
               if (confirmed) {
                    this.sendMessage({message: "Your order has been placed!", user: true})
                } else {
                    this.sendMessage({message: "Your Order has been Cancelled!", error: true})
                }
               this.resetVariables();
               this.showChatOptions();
           }
        })
    }

    DisplayMessage(message) {
        this.sendMessage({message})
    }

    showChatOptions() {
        this.sendMessage({message: "Please make a choice:"});
        for (let [code, action] of Object.entries(this.chatOptions)) {
            this.sendMessage({message: `Select ${code} for ${action}`});
        }
    }

    resetVariables() {
        this.chatOptions = this.commands;
        this.state = this.states[0]
        this.currentOrderItem = null;

    }

    sendMessage({message, user, error}) {
        const text = document.createElement('li');
        if (user) {
        //     text.style.backgroundColor = "#4390f4";
        text.className = 'textbox'
        text.style.textAlign = 'right';
        text.style.color = 'black';
        } else if (error) {
            text.style.backgroundColor = "#ff1515";
        }
        text.textContent = message;
        this.messages.appendChild(text);
        window.scrollTo(0, document.body.scrollHeight);
    }

    getcustomerInput() {
        return this.customerInput.value;
    }

    clearcustomerInput() {
        this.customerInput.value = "";
    }

    validate(input) {
        if (this.state !== this.states[2]) {
            this.validOptions = Object.keys(this.chatOptions)
            if(!this.validOptions.includes(input)) return this.sendMessage({message: "Wrong Input, please retry", error: true});
        }

        if (!input.trim()) return
        if (isNaN(input)) return this.sendMessage({message: "PLEASE MAKE A CHOICE", error: true})
        return true;
    }

    processInput(message) {
        if (message === 1) this.placeOrder();
        else if (message === 97) this.getCurrentOrder();
        else if (message === 98) this.getOrderHistory();
        else if (message === 99) this.checkoutOrder();
        else if (message === 0) this.cancelOrOrder();
    }

    async getOrderItems() {
        try {
            const data = await fetch("/orderItems");
            const response = await data.json()
            return response
        } catch (error) {
            return this.sendMessage({message: error.message});
        }
    }

    async placeOrder() {
        this.orderItems = JSON.parse(await this.getOrderItems());
        this.chatOptions = this.orderItems;
        this.showChatOptions();
        this.state = this.states[1];
    }

    updateCustSession() {
        this.socket.emit("customer:update-session", {customer: this.customer});
    }

    confirmOrderPlacement(value) {
        if (value === this.confirmOrCancel[1]) {
            this.customer.placeOrder(this.currentOrderItem);
            this.updateCustSession();
            return true;
        }
    }

    getCurrentOrder() {
        const currentOrder = this.customer.currentOrder;
        if (!currentOrder) {
            return this.sendMessage({message: "You have no current order"});
        }

        this.sendMessage({message: "Here's what you have in your order:"});
        currentOrder.orderItems.forEach(orderItem => {
            this.sendMessage({message: `${orderItem.name} worth of $${orderItem.totalPrice} `})
        })
        this.sendMessage({message: `The total is: $${currentOrder.getTotal()}`})
    }

    getOrderHistory() {
        const orderHistory = this.customer.orderHistory;
        if (orderHistory.length > 0) {
            this.sendMessage({message: "Here it is:"})
            for (let i = 0; i < orderHistory.length; i++) {
                const order = orderHistory[i];
                this.sendMessage({message: `${i+1}: "${order.state}" containing ${order.getItemNames()} with a total of $${order.getTotal()}`})
            }
        } else {
            this.sendMessage({message: "Nothing in your history yet "})
        }
    }

    checkoutOrder() {
        if (!this.customer.currentOrder) {
            this.sendMessage({message: "No order to place"});
        } else {
            // change the current order state to ordered
            this.customer.currentOrder.state = this.customer.currentOrder.states[2];
            this.sendMessage({message: "order placed"});
            this.customer.orderHistory.push(this.customer.currentOrder);
            this.customer.currentOrder = null;
            this.resetVariables();
            this.updateCustSession();
        }
    }

    cancelOrOrder() {
        if (this.customer.currentOrder) {
            this.customer.currentOrder.state = this.customer.currentOrder.states[0];
            this.customer.orderHistory.push(this.customer.currentOrder);
            this.customer.currentOrder = null;
            this.updateCustSession();
            this.resetVariables();
            this.sendMessage({message: "Your current order has been cancelled!", user: true});
        } else {
            this.sendMessage({message: "You do not have a current order"});
        }
    }
}

export default ChatBot ;