function createInspectorLike() {
	var viewModel = new Cesium.CesiumInspectorViewModel(scene);
	var container = document.getElementById('advancedToolbar');
	var element = document.createElement('div');
	var text = document.createElement('div');
	text.textContent = 'Cesium Inspector';
	text.className = 'cesium-cesiumInspector-button';
	text.setAttribute('data-bind', 'click: toggleDropDown');
	element.appendChild(text);
	element.className = 'cesium-cesiumInspector';
	element.setAttribute('data-bind', 'css: { "cesium-cesiumInspector-visible" : dropDownVisible, "cesium-cesiumInspector-hidden" : !dropDownVisible }');
	container.appendChild(element);

	var panel = document.createElement('div');
	panel.className = 'cesium-cesiumInspector-dropDown';
	element.appendChild(panel);

	// General
	var general = document.createElement('div');
	general.className = 'cesium-cesiumInspector-sectionHeader';
	var plus = document.createElement('span');
	plus.className = 'cesium-cesiumInspector-toggleSwitch';
	plus.setAttribute('data-bind', 'click: toggleGeneral, text: generalSwitchText');
	general.appendChild(plus);
	general.appendChild(document.createTextNode('General'));
	panel.appendChild(general);

	var generalSection = document.createElement('div');
	generalSection.className = 'cesium-cesiumInspector-section';
	generalSection.setAttribute('data-bind', 'css: {"cesium-cesiumInspector-show" : generalVisible, "cesium-cesiumInspector-hide" : !generalVisible}');
	panel.appendChild(generalSection);
	var debugShowFrustums = document.createElement('div');
	generalSection.appendChild(debugShowFrustums);
	var frustumStats = document.createElement('div');
	frustumStats.className = 'cesium-cesiumInspector-frustumStats';
	frustumStats.setAttribute('data-bind', 'css: {"cesium-cesiumInspector-show" : frustums, "cesium-cesiumInspector-hide" : !frustums}, html: frustumStatisticText');
	var frustumsCheckbox = document.createElement('input');
	frustumsCheckbox.type = 'checkbox';
	frustumsCheckbox.setAttribute('data-bind', 'checked: frustums, click: showFrustums');
	debugShowFrustums.appendChild(frustumsCheckbox);
	debugShowFrustums.appendChild(document.createTextNode('Show Frustums'));
	debugShowFrustums.appendChild(frustumStats);
}

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
		domConstruct.place('<br><input type="text" id="zCtrySearch" value="Country1, Country2..." style="color:#888;" onfocus="inputFocus(this)" onblur="inputBlur(this)">','zoneMenu');
		Sandcastle.addToolbarButton('Search', function() {
			requestZones();
		},'zoneMenu');
		domConstruct.place('<br><input type="text" id="zTypeSearch" value="Type" style="color:#888;" onfocus="inputFocus(this)" onblur="inputBlur(this)">','zoneMenu');
		Sandcastle.addToolbarButton('Remove all', function() {
			for (var key in zonePrimitives) {
				primitives.remove(zonePrimitives[key]);
			}
			zonePrimitives = [];
		},'zoneMenu');
	});
}
