// Lebensmittel
class Grocery {
    constructor(name, category, unit) {
        this.name = name;
        this.category = category;
        this.unit = unit;
    }

}

// Gerichte
class Dish {
    constructor(name, properties) {
        this.name = name;
        this.properties = properties;
        this.ingredients = new Map();
        this.quantity = 0;
    }

    addIngredient(ingredient) {
        this.ingredients.set(ingredient.name, ingredient);
        ingredient.dish = this;
    }

    getShoppingListItems() {
        let shoppingListItems = [];
        this.ingredients.forEach((i) => {
            let shoppingListItem = new ShoppingListItem(i.grocery, i.quantity * this.quantity)
            shoppingListItems.push(shoppingListItem);
        });
        return shoppingListItems;
    }
}

// Jeden Monat
class MonthlyItem {
    constructor(grocery, quantity) {
        this.name = grocery.name;
        this.grocery = grocery;
        this.quantity = quantity;
        this.defaultQuantity = quantity;
    }
}

// Jede Woche
class WeeklyItem {
    constructor(grocery, quantity) {
        this.name = grocery.name;
        this.grocery = grocery;
        this.quantity = quantity;
        this.defaultQuantity = quantity;
    }
}

// Zutaten
class Ingredient {
    constructor(grocery, quantity) {
        this.name = grocery.name;
        this.grocery = grocery;
        this.quantity = quantity;
    }
}

// Einkaufslistenposition
class ShoppingListItem {
    constructor(grocery, quantity) {
        this.name = grocery.name;
        this.grocery = grocery;
        this.quantity = quantity;
    }
}

class ShoppingList {
    constructor() {
        this.items = [];
    }

    // This can be a Dish, MonthlyItem or WeeklyItem
    addItem(item) {
        let shoppingListItem = new ShoppingListItem(item.grocery, item.quantity)
        this.items.push(shoppingListItem);
    }

    // Add the ingredients for a whole dish
    addDish(dish) {
        let items = dish.getShoppingListItems()
        for(let i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }
    }

    // Returns a list with unique groceries and quantities added up
    aggregate() {
        let uniqueItems = new Map();

        for (let i = 0; i < this.items.length; i++) {

            // If item exists already, add quantity
            if (uniqueItems.has(this.items[i].name)) {
                let item = uniqueItems.get(this.items[i].name)
                item.quantity += this.items[i].quantity;
            }
            else {
                uniqueItems.set(this.items[i].name, this.items[i])
            }
        }

        return Array.from(uniqueItems, ([name, value]) => ( value ));
    }

}