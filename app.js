const budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let calculateTotal = function(type){
        let sum = 0
        data.allItems[type].forEach(cur => {
            sum = sum + cur.value
        })
        data.totals[type] = sum
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID

            // creating new id eg inc[5].id + 1
            if (data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0
            }

            if (type === 'exp'){
                newItem = new Expense(ID, des, val)
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val)
            }

            data.allItems[type].push(newItem);
            return newItem
        },

        deleteItem: function(type, id){
            let ids, index

            ids = data.allItems[type].map(function (current) {
                    return current.id
            })

            index = ids.indexOf(id)

            if (index !== -1){
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget : function () {
            calculateTotal('exp')
            calculateTotal('inc')

            data.budget = data.totals.inc - data.totals.exp
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }else {
                data.percentage = -1
            }
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data)
        }
    }

})();

const UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type){
            let html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>'
            }else if(type === 'exp') {
                element = DOMstrings.expensesContainer
                html = ' <div class="item clearfix" id="exp-%id%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__percentage">21%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>'
            }
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem : function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },

        clearFields: function(){
            let fields, fieldsArr

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function (current, index,array) {
                current.value = ""
            })

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).innerText = obj.budget
            document.querySelector(DOMstrings.incomeLabel).innerText = obj.totalInc
            document.querySelector(DOMstrings.expenseLabel).innerText = obj.totalExp

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).innerText = obj.percentage + '%'
            }else{
                document.querySelector(DOMstrings.percentageLabel).innerText = '---'

            }
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();

const controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function(){
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', event => {
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }

    let updateBudget = function(){
        budgetCtrl.calculateBudget()

        let budget = budgetCtrl.getBudget()
        UICtrl.displayBudget(budget)
    }

    let ctrlAddItem = function(){
        let input , newItem
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            UICtrl.addListItem(newItem, input.type)
            UICtrl.clearFields()
            updateBudget()
        }
    }

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
        if (itemID){
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            budgetCtrl.deleteItem(type,ID)
            UICtrl.deleteListItem(itemID)
            updateBudget()
        }
    }

    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners()
        }
    }

})(budgetController, UIController);

controller.init()