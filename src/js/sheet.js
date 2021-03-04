async function getData(sheetKey) {
    return Promise.all([
        readSheetData(sheetKey, 1),
        readSheetData(sheetKey, 2),
        readSheetData(sheetKey, 3),
        readSheetData(sheetKey, 4),
        readSheetData(sheetKey, 5)
    ])
}

async function readSheetData(workbookId, sheetNumber) {
    let values;
    let json;

    try {
        values = await fetch('https://spreadsheets.google.com/feeds/list/' + workbookId + '/' + sheetNumber + '/public/values?alt=json');
        json = await values.json();
    }
    catch (error) {
        if (error.name === 'FetchError') {
            console.error("No data returned. Maybe sheet not published to web, wrong workbook ID, or sheet " + sheetNumber + " does not exist in sheet?");
        }

        return { "error": "No data returned. Maybe sheet not published to web, wrong workbook ID, or sheet " + sheetNumber + " does not exist in sheet?" };
    }

    let rows = json.feed.entry;

    let data = {};
    data.title = json.feed.title['$t']
    let dataRows = [];

    if (rows) {
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let rowObj = {}
            for (column in row) {
                if (column.startsWith('gsx$')) {
                    let columnName = column.split("$")[1];
                    rowObj[columnName] = row[column]["$t"];
                }
            }
            dataRows.push(rowObj);
        }
    }

    data.rows = dataRows;
    return data;
}


function _makeDictFromData(data) {
    dataDict = {};

    // Go through sheets
    for (let i = 0; i < data.length; i++) {

        let entries = [];
        // Go through each row in a sheet
        for (let j = 0; j < data[i].rows.length; j++) {
            rowObj = _parseProperties(data[i].rows[j])
            rowObj.id = j;
            entries.push(rowObj);
        }

        dataDict[data[i].title.toLowerCase()] = entries;
    }

    return dataDict;
}

function _parseProperties(obj) {

    result = {}
    for (var key in obj) {

        if (!obj.hasOwnProperty(key)) continue;

        if (key === "name")
            result.name = obj[key];
        else if (["TRUE", "FALSE"].includes(obj[key])) {
            result[key] = obj[key] === "TRUE" ? true : false;
        }
        else if (!isNaN(parseFloat(obj[key]))) {
            result[key] = parseFloat(obj[key].replace(',', '.'));
        }
        else if (!isNaN(parseInt(obj[key]))) {
            result[key] = parseInt(obj[key]);
        }

        else {
            result[key] = obj[key];
        }
    }

    return result;
}


function _makeObjectsFromData(data) {

    let result = {}

    // Groceries
    let groceriesRaw = data["lebensmittel"];
    result.groceries = [];
    for (let i = 0; i < groceriesRaw.length; i++) {
        let grocery = new Grocery(groceriesRaw[i].name, groceriesRaw[i].category, groceriesRaw[i].mengeneinheit);
        result.groceries.push(grocery);
    }

    // Dishes
    let dishesRaw = data["gerichte"];
    result.dishes = [];
    for (let i = 0; i < dishesRaw.length; i++) {
        let dish = new Dish(dishesRaw[i].name, dishesRaw[i]);
        result.dishes.push(dish);
    }

    // Ingredients
    let ingredientsRaw = data["zutaten"];
    result.ingredients = [];
    for (let i = 0; i < ingredientsRaw.length; i++) {

        // Find the dish
        let dish = _findBy(result.dishes, "name", ingredientsRaw[i].hauptgericht);

        // Find the grocery
        let grocery = _findBy(result.groceries, "name", ingredientsRaw[i].zutat);

        let ingredient = new Ingredient(grocery, ingredientsRaw[i].menge);
        dish.addIngredient(ingredient);

        result.ingredients.push(ingredient);
    }

    // Monthly
    let monthlyItemsRaw = data["jeden monat"];
    result.monthlyItems = [];
    for (let i = 0; i < monthlyItemsRaw.length; i++) {

        // Find the grocery
        let grocery = _findBy(result.groceries, "name", monthlyItemsRaw[i].name);

        let item = new MonthlyItem(grocery, monthlyItemsRaw[i].menge);
        result.monthlyItems.push(item);
    }

    // Weekly
    let weeklyItemsRaw = data["jede woche"];
    result.weeklyItems = [];
    for (let i = 0; i < weeklyItemsRaw.length; i++) {
        // Find the grocery
        let grocery = _findBy(result.groceries, "name", weeklyItemsRaw[i].name);

        let item = new WeeklyItem(grocery, weeklyItemsRaw[i].menge);
        result.weeklyItems.push(item);
    }

    return result;
}

function _findBy(listOfObjects, propertyName, propertyValue) {
    let filteredList = listOfObjects.filter((o) => { return o[propertyName] == propertyValue })

    if (filteredList.length === 0) {
        console.error("Object not found in list with " + propertyName + " = " + propertyValue);
        console.dir(listOfObjects);
        return null;
    }

    if (filteredList.length > 1)
        console.error("More than one object found in list with " + propertyName + " = " + propertyValue + ". Returning first.");

    return filteredList[0];
}
