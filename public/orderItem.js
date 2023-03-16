class OrderItem {
    constructor(name, price) {
        this.name = name;
        this.price = parseFloat(price);
        this.quantity = null;
    }

    get totalPrice() {
        if (!this.quantity) return this._price;
        return this.price * this.quantity;
    }

    static createFromObject(itemObject) {
        // itemObject should contain name, price, and quantity
        const item = new this(itemObject.name, itemObject.price);
        item.quantity = itemObject.quantity;
        return item;
    }
}

export default OrderItem;