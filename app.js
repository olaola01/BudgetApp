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
        expensesContainer: '.expenses__list'
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
                html = '<div class="item clearfix" id="income-%id%">\n' +
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
                html = ' <div class="item clearfix" id="expense-%id%">\n' +
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

        clearFields: function(){
            let fields, fieldsArr

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function (current, index,array) {
                current.value = ""
            })

            fieldsArr[0].focus();
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
    }

    let updateBudget = function(){
        budgetCtrl.calculateBudget()

        let budget = budgetCtrl.getBudget()
        console.log(budget)
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

    return {
        init: function () {
            setupEventListeners()
        }
    }

})(budgetController, UIController);

controller.init()