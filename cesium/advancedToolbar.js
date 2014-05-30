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
	switch (field) {
		case "zones":
			Sandcastle.addToolbarButton('Remove all', function() {
				for (var key in zonePrimitives) {
					primitives.remove(zonePrimitives[key]);
				}
				zonePrimitives = [];
			}, field + 'Menu');
		break;
		case "points":
			Sandcastle.addToolbarButton('Remove all', function() {
				billboards.removeAll();
				points = !points;
			}, field + 'Menu');
	}
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
		Sandcastle.addToolbarButton('Search', function() {
			requestZones(field, attrArray);
		}, field + 'Menu');
		createRemoveButton(field);
	});
}
