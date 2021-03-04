var foodData;

var shoppingList;
var monthlyOn = true;
var weeklyOn = true;

var app;

getData("15ypt277oGcBK4hWXwFsKDTWX-Xxo5uYTb_--19CPRb4").then(run);

function run(data) {

    data = _makeDictFromData(data)
    foodData = _makeObjectsFromData(data);

    _updateWeeklyAndMonthlyOnSwitch();

    app = new Vue({
        el: '#app',
        data: {
            weeklyItems: foodData.weeklyItems,
            monthlyItems: foodData.monthlyItems,
            dishes: foodData.dishes,
            shoppingList: shoppingList
        }
    })

    updateShoppingList();
}


function changeQuantity(btn, direction) {
    let collectionKey = btn.dataset.type;
    let itemKey = btn.dataset.name;
    let itemCollection = foodData[collectionKey];
    let item = _findBy(itemCollection, "name", itemKey);

    if (collectionKey === "dishes") {
        item.quantity += direction === "more" ? 1 : item.quantity >= 1 ? -1 : 0;
    }
    else if (["g", "ml"].includes(item.grocery.unit)) {
        item.quantity += direction === "more" ? 100 : item.quantity >= 100 ? -100 : 0;
    }
    else {
        item.quantity += direction === "more" ? 1 : item.quantity >= 1 ? -1 : 0;
    }

    updateShoppingList();
}


function updateShoppingList() {
    let shoppingListObj = new ShoppingList();

    // Weekly
    if (weeklyOn === true) {
        let weeklyItems = foodData.weeklyItems;
        for (let i = 0; i < weeklyItems.length; i++) {
            if (weeklyItems[i].quantity > 0)
                shoppingListObj.addItem(weeklyItems[i]);
        }
    }

    // Monthly
    if (monthlyOn === true) {
        let monthlyItems = foodData.monthlyItems;
        for (let i = 0; i < monthlyItems.length; i++) {
            if (monthlyItems[i].quantity > 0)
                shoppingListObj.
                    addItem(monthlyItems[i]);
        }
    }

    // Dishes
    let dishes = foodData.dishes;
    for (let i = 0; i < dishes.length; i++) {
        if (dishes[i].quantity > 0)
            shoppingListObj.addDish(dishes[i]);
    }

    shoppingList = shoppingListObj.aggregate();
    shoppingList = _.sortBy(shoppingList, function (o) { return `${o.grocery.category}_${o.name}`; })
    app._data.shoppingList = shoppingList;
}

function _updateWeeklyAndMonthlyOnSwitch() {
    // Set switch for monthly on
    monthlyOnSwitch = document.getElementById("monthlyOn")
    if (monthlyOn === true) {
        monthlyOnSwitch.setAttribute("checked", "")
    }
    else {
        monthlyOnSwitch.removeAttribute("checked")
    }

    // Set switch for monthly on
    weeklyOnSwitch = document.getElementById("weeklyOn")
    if (weeklyOn === true) {
        weeklyOnSwitch.setAttribute("checked", "")
    }
    else {
        weeklyOnSwitch.removeAttribute("checked")
    }
}

function monthlyOnChanged(elem) {
    monthlyOn = elem.checked;
    updateShoppingList();
}

function weeklyOnChanged(elem) {
    weeklyOn = elem.checked;
    updateShoppingList();
}