function requestZones(field, attrArray) {
	var query = {};
	
	for (var i = 0; i < attrArray.length; i++) {
		var element = document.getElementById(attrArray[i]);
		if (element.value != "" && element.value != element.defaultValue) {
			query[attrArray[i]] = element.value;
		}
	}
	
	var element = document.getElementById(field + "Limit");
	if (element.value != "" && element.value != element.defaultValue) {
		query.Limit = element.value;
	}
	
	request(field, query);
}

function inputFocus(i){
    if(i.value==i.defaultValue){ i.value=""; i.style.color="#000"; }
}
function inputBlur(i){
    if(i.value==""){ i.value=i.defaultValue; i.style.color="#888"; }
}

function createRemoveButton(field) {
	require(['dijit/form/Button'], function (Button) {
		var fct;
		switch (field) {
			case "zones":
				fct = function() {
					for (var key in zonePrimitives) {
						primitives.remove(zonePrimitives[key]);
					}
					zonePrimitives = [];
				};
				break;
			case "points":
				fct = function() {
					billboards.removeAll();
					points = !points;
				};
		}
		
		var button = new Button({
			label: "Remove all",
			onClick: fct
		});
		document.getElementById(field + 'Menu').appendChild(button.domNode);
	});
}

/**
 * @param {String[]} attrArray An array with the names of the attributes as treated by queries.js
 * @param {String[]} hintArray An array with the hints that will appear in the text field.
 * 
 * @throws {NullPointerException} If hintArray is shorter than attrArray.
 */

function createDDMenu(field, attrArray, hintArray) {
	require(['dojo/dom-construct', 'dijit/TitlePane'], function (domConstruct, TitlePane) {
		var tp = new TitlePane({
			title: field + 'Search',
			id: field + '-title-pane',
			content: '<div id="' + field + 'Menu"></div>',
			open: false
		});
		
		document.getElementById("toolbar").appendChild(tp.domNode);
		for (var i = 0; i < attrArray.length; i++) {
			domConstruct.place('<input type="text" id="' + attrArray[i] + '" value="' + hintArray[i] + '" style="color:#888; width:20em;" onfocus="inputFocus(this)" onblur="inputBlur(this)"><br>', field + 'Menu');
		}
		domConstruct.place('<input type="text" id="' + field + 'Limit" value="Max. results" style="color:#888; width:20em;" onfocus="inputFocus(this)" onblur="inputBlur(this)"><br>', field + 'Menu');

		require(['dijit/form/Button'], function (Button) {
			var searchButton = new Button({
				label: "Search",
				onClick: function() {requestZones(field, attrArray);}
			});
			document.getElementById(field + 'Menu').appendChild(searchButton.domNode);
		});

		createRemoveButton(field);
	});
}
