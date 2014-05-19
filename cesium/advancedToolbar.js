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

function createDDMenu() {
	require(['dojo/dom-construct', 'dijit/TitlePane'], function (domConstruct, TitlePane) {
		var tp = new TitlePane({
			title: 'Manipulate Layers',
			id:'title-pane',
			content: '<div id="layerTable"></div>',
			open: false
		});
		document.getElementById("advancedToolbar").appendChild(tp.domNode);
		document.getElementById('layerTable').innerHTML = '';
		domConstruct.place('<div>ciao</div>','layerTable');
		Sandcastle.addToolbarButton('name', function(){},'layerTable');
		//updateUserInterface(imageryLayers);
	});
}