
//BUDGET CONTROLLER
var BudgetCtrl = (function(){

	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calculatePerc = function(totalInc){

		if(totalInc > 0 ){
			this.percentage = Math.round((this.value / totalInc) * 100);
		}else{
			this.percentage = -1;
		}
		
	};

	Expense.prototype.getPerc = function(){
		return this.percentage;
	}

	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {		
		allItems:{
			exp : [],
			inc : []
		},

		totals:{
			exp : 0,
			inc : 0
		},

		budget:0,
		percentage:-1
	};

	var calcTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		});
		data.totals[type] = sum;
	};

	return{

		addItem : function(typ,des,val){
			var newItem, ID;

			//[1 2 3 4 5] then next id number will be 6 what if we delete some items
			//[1 2 5 8] then next id number must be 9 so the ID will be
			//ID = last ID +1
			if(data.allItems[typ].length > 0){
				ID = data.allItems[typ][data.allItems[typ].length-1].id + 1;
			}
			else{
				ID = 0;
			}			

			//Create new ID based on inc or exp
			if(typ === 'exp'){
				newItem = new Expense(ID,des,val);
			}
			else if(typ === 'inc'){
				newItem = new Income(ID,des,val);
			}

			//Push it into our data structure
			data.allItems[typ].push(newItem);

			// return new Element
			return newItem;
		},

		delItem:function(type,id){
			var ids,index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(id);
			//index will be -1 in case the item we were searching is not found in the array
			if(index !== -1){
				data.allItems[type].splice(index,1); //splice takes two arguments position number 
													//and number of arguments we want to delete
			}
		},

		calcBudget:function(){

			//calculate total income and expenses
			calcTotal('exp');
			calcTotal('inc');

			//calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			//calcualte the percentage of income that we spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}else{
				data.percentage = -1;
			}
			
		},

		getBudget:function(){
			return{
				budget : data.budget,
				totInc : data.totals.inc,
				totExp : data.totals.exp,
				percentage : data.percentage
			}
		},

		calcPerecentages:function(){

			data.allItems.exp.forEach(function(current){
				current.calculatePerc(data.totals.inc);

			});

		},

		getPercentages:function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPerc();
			});
			return allPerc;
		},

		

		testing: function(){
			console.log(data);
		}
	};

})();


//UI CONTOLLER
var UICtrl = (function(){

	var DOMstrings = {
		inputType : '.add__type',
		inputDescription : '.add__description',
		inputVal : '.add__value',
		inputBtn : '.add__btn',
		incContainer : '.income__list',
		expContainer : '.expenses__list',
		BudgetLabel : '.budget__value',
		IncLabel : '.budget__income--value',
		ExpLabel : '.budget__expenses--value',
		PerLabel:'.budget__expenses--percentage',
		container : '.container',
		expPerc : '.item__percentage',
		dateLabel :'.budget__title--month' 

	}; 

	var nodeListForEach = function(list,callback){
		for(var i=0; i<list.length; i++){
			callback(list[i],i);
		}
	};

	var formatNumber = function(num,type){
			/* +/- before number according to the type
				exactly two decimal points
				coma separating the thousands

			*/
			var numSplit;
			num = Math.abs(num);
			num = num.toFixed(2); //it always puts decimal point on exactly two dec numbers on which we call the methods
			numSplit = num.split('.');
			int = numSplit[0];
			dec = numSplit[1];
			if(int.length > 3){
				int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
			}

			(type === 'exp' ? '-' :'+')

			return (type === 'exp' ? '-' :'+') + ' '+ int +'.'+ dec;
		};



	return{

		getInput: function(){
			return{
				type : document.querySelector(DOMstrings.inputType).value,
				description : document.querySelector(DOMstrings.inputDescription).value,
				val : parseFloat(document.querySelector(DOMstrings.inputVal).value)
			};			
		},

		addListItem:function(obj,type){

			var html,newHtml,element;

			//create HTML strings with placeholder
			if(type === 'inc'){
				element = DOMstrings.incContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			else if(type === 'exp'){
				element = DOMstrings.expContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			//Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		delListItem:function(selcID){
			
			var el = document.getElementById(selcID);
            el.parentNode.removeChild(el);

		},	

		clearFields:function(){
			var fields,fieldsArray;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputVal);//Here we get fields in the form of list
			fieldsArray = Array.prototype.slice.call(fields);//we converted the fields which in the form of list into array, as we have lot of predefined methods for array's to perform on 
			
			fieldsArray.forEach(function(current,index,array){
				current.value = "";				
			});
			fieldsArray[0].focus();

		},

		dispBudget:function(obj){
			var type;
			obj.budget>0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.BudgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.IncLabel).textContent = formatNumber(obj.totInc,'inc');
			document.querySelector(DOMstrings.ExpLabel).textContent = formatNumber(obj.totExp,'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.PerLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.PerLabel).textContent = '---';
			}
			
		},

		dispPercentage : function(perValues){ //here perValues is array of percentages
			var fields = document.querySelectorAll(DOMstrings.expPerc); //we get NodeList from this step  
			

			nodeListForEach(fields,function(current,index){

				if(perValues[index] > 0){
					current.textContent = perValues[index] + '%';	
				}
				else{
					current.textContent =  '---';
				}
				

			});
		},

		disMonth : function(){
			var now, year, month,months;

			months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();

			//var christmas = new Date(2019, 12, 25);

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
		},

		changedType : function(){

			var fields = document.querySelectorAll(DOMstrings.inputType + ',' 
				+ DOMstrings.inputDescription + ','	
				+ DOMstrings.inputVal);

			nodeListForEach(fields,function(curr){
				curr.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		
		getDOMstrings : function(){
			return DOMstrings;
		}
	};


})();



//GLOBAL APP CONTROLLER
var AppCtrl = (function(budgCtrl,uiCtrl){

	var setUpEventListeners = function() {

		var DOMelements  = uiCtrl.getDOMstrings();
		document.querySelector(DOMelements.inputBtn).addEventListener('click', CtrlAddItem);

		document.addEventListener('keypress',function(event){

			if(event.keyCode === 13 || event.which === 13){
				CtrlAddItem();
			}		
		});

		document.querySelector(DOMelements.container).addEventListener('click', CtrlDelItem);
		document.querySelector(DOMelements.inputType).addEventListener('change', uiCtrl.changedType);
	};

	var updateBudg = function(){

		//1. Calculate budget
		budgCtrl.calcBudget();
		
		//2. Return the budget
		var budget = budgCtrl.getBudget();
		
		//3. Display the budget
		uiCtrl.dispBudget(budget);
			//console.log(budget);
	};

	var updatePercentages = function(){

		//1. calculate the percentages
		budgCtrl.calcPerecentages();

		//2. read them from the budget controller
		var percs = budgCtrl.getPercentages(); 

		//3. update the UI with new percentages
		uiCtrl.dispPercentage(percs);
	}	

	var CtrlAddItem = function(){
		var item, newItem;

		//1. get the field input
		input = uiCtrl.getInput();

		if(input.description !== "" && !isNaN(input.val) && input.val>0){
			//2. Add the item to the Budget contorller
			newItem = budgCtrl.addItem(input.type,input.description,input.val);	

			//3. Add the item to the UI interface
			uiCtrl.addListItem(newItem,input.type);

			//4. Clear the fields
			uiCtrl.clearFields();

			//5. Claculate and update budget
			updateBudg();

			//6. Calculate and update percentages
			updatePercentages();
		}		
	};


	var CtrlDelItem = function(event){
		var itemID,splitID,type,ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. delete item from data structure
			budgCtrl.delItem(type,ID);

			//2. delete item from UI
			uiCtrl.delListItem(itemID);

			//3.update and show the new budget a
			updateBudg();

			//4. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('application started');
			uiCtrl.dispBudget({
				budget : 0,
				totInc : 0,
				totExp : 0,
				percentage : -1
			});
			uiCtrl.disMonth();
			setUpEventListeners();
		} 
	};
	

})(BudgetCtrl,UICtrl); 


AppCtrl.init();
















