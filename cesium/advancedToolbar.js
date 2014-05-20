function requestZones() {
	var query = {};
	var nameVal = document.getElementById('zNameSearch').value;
	var ctryVal = document.getElementById('zCtrySearch').value;
	var typeVal = document.getElementById('zTypeSearch').value;
	if (nameVal != "" && nameVal != document.getElementById('zNameSearch').defaultValue) {
		query.Name = nameVal;
	}
	if (ctryVal != "" && ctryVal != document.getElementById('zCtrySearch').defaultValue) {
		query.Ctry = ctryVal;
	}
	if (typeVal != "" && typeVal != document.getElementById('zTypeSearch').defaultValue) {
		query.Type = typeVal;
	}
	
	request('zones', query);
}

function inputFocus(i){
    if(i.value==i.defaultValue){ i.value=""; i.style.color="#000"; }
}
function inputBlur(i){
    if(i.value==""){ i.value=i.defaultValue; i.style.color="#888"; }
}

function createDDMenu() {
	require(['dojo/dom-construct', 'dijit/TitlePane'], function (domConstruct, TitlePane) {
		var tp = new TitlePane({
			title: 'Search Zones',
			id:'title-pane',
			content: '<div id="zoneMenu"></div>',
			open: false
		});
		
		document.getElementById("toolbar").appendChild(tp.domNode);
		domConstruct.place('<input type="text" id="zNameSearch" value="Name (exact or regex)" style="color:#888;" onfocus="inputFocus(this)" onblur="inputBlur(this)">','zoneMenu');
		domConstruct.place('<br><input type="text" id="zCtrySearch" value="Country1, /country2/i..." style="color:#888;" onfocus="inputFocus(this)" onblur="inputBlur(this)">','zoneMenu');
		Sandcastle.addToolbarButton('Search', function() {
			requestZones();
		},'zoneMenu');
		domConstruct.place('<br><input type="text" id="zTypeSearch" value="Type1, /type2/i..." style="color:#888;" onfocus="inputFocus(this)" onblur="inputBlur(this)">','zoneMenu');
		Sandcastle.addToolbarButton('Remove all', function() {
			for (var key in zonePrimitives) {
				primitives.remove(zonePrimitives[key]);
			}
			zonePrimitives = [];
		},'zoneMenu');
	});
}
