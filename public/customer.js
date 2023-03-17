import Order from "./Order.js";

class Customer {
    constructor (name) {
        this.name = name;
        this.currentOrder = null;
        this.orderHistory = [];
    }

    placeOrder(orderItem) {
        if (this.currentOrder && this.currentOrder.isActive()) {
            this.currentOrder.addItem(orderItem);
        } else {
            this.currentOrder = new Order();
            this.currentOrder.addItem(orderItem);
        }
    }

    static  createFromSession(customerObject) {
        const customer =  new this(customerObject.name);
        const currentOrder = customerObject.currentOrder;
        const orderHistory = customerObject.orderHistory;

        if (currentOrder) {
            const order = Order.createFromObject(customerObject.currentOrder);
            customer.currentOrder = order;
        }

        if (orderHistory.length > 0) {
            orderHistory.forEach(orderObject => {
                const order = Order.createFromObject(orderObject);
                customer.orderHistory.push(order);
            })
        }

        return customer;
    }
}

export default Customer;