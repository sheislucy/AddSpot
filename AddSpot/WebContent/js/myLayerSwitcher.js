MyLayerSwitcher = OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {
	initialize : function(options) {
		OpenLayers.Control.LayerSwitcher.prototype.initialize(options);
	},
	CLASS_NAME : "MyLayerSwitcher"
});

MyLayerSwitcher.prototype.loadContents = function() {
	// layers list div
	this.layersDiv = document.createElement("div");
	this.layersDiv.id = this.id + "_layersDiv";
	OpenLayers.Element.addClass(this.layersDiv, "layersDiv");

	this.baseLbl = document.createElement("div");
	this.baseLbl.innerHTML = OpenLayers.i18n("地图");
	OpenLayers.Element.addClass(this.baseLbl, "baseLbl");

	this.baseLayersDiv = document.createElement("div");
	OpenLayers.Element.addClass(this.baseLayersDiv, "baseLayersDiv");

	this.dataLbl = document.createElement("div");
	//this.dataLbl.innerHTML = OpenLayers.i18n("热点");
	this.dataLbl.style.clear = "both";
	OpenLayers.Element.addClass(this.dataLbl, "dataLbl");

	this.dataLayersDiv = document.createElement("div");
	OpenLayers.Element.addClass(this.dataLayersDiv, "dataLayersDiv");

	if (this.ascending) {
		this.layersDiv.appendChild(this.baseLbl);
		this.layersDiv.appendChild(this.baseLayersDiv);
		this.layersDiv.appendChild(this.dataLbl);
		this.layersDiv.appendChild(this.dataLayersDiv);
	} else {
		this.layersDiv.appendChild(this.dataLbl);
		this.layersDiv.appendChild(this.dataLayersDiv);
		this.layersDiv.appendChild(this.baseLbl);
		this.layersDiv.appendChild(this.baseLayersDiv);
	}

	this.div.appendChild(this.layersDiv);

	if (this.roundedCorner) {
		OpenLayers.Rico.Corner.round(this.div, {
			corners : "tl bl",
			bgColor : "transparent",
			color : this.roundedCornerColor,
			blend : false
		});
		OpenLayers.Rico.Corner.changeOpacity(this.layersDiv, 0.75);
	}

	// maximize button div
	var img = web_context + '/images/material/layer-switcher-maximize.png';
	this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
			"OpenLayers_Control_MaximizeDiv", null, null, img, "absolute");
	OpenLayers.Element.addClass(this.maximizeDiv, "maximizeDiv olButton");
	this.maximizeDiv.style.display = "none";

	this.div.appendChild(this.maximizeDiv);

	// minimize button div
	var img = web_context + '/images/material/layer-switcher-minimize.png';
	this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
			"OpenLayers_Control_MinimizeDiv", null, null, img, "absolute");
	OpenLayers.Element.addClass(this.minimizeDiv, "minimizeDiv olButton");
	this.minimizeDiv.style.display = "none";

	this.div.appendChild(this.minimizeDiv);
};

MyLayerSwitcher.prototype.redraw = function() {
	// if the state hasn't changed since last redraw, no need
	// to do anything. Just return the existing div.
	if (!this.checkRedraw()) {
		return this.div;
	}

	// clear out previous layers
	this.clearLayersArray("base");
	this.clearLayersArray("data");

	var containsOverlays = false;
	var containsBaseLayers = false;

	// Save state -- for checking layer if the map state changed.
	// We save this before redrawing, because in the process of redrawing
	// we will trigger more visibility changes, and we want to not redraw
	// and enter an infinite loop.
	var len = this.map.layers.length;
	this.layerStates = new Array(len);
	for ( var i = 0; i < len; i++) {
		var layer = this.map.layers[i];
		this.layerStates[i] = {
			'name' : layer.name,
			'visibility' : layer.visibility,
			'inRange' : layer.inRange,
			'id' : layer.id
		};
	}

	var layers = this.map.layers.slice();
	if (!this.ascending) {
		layers.reverse();
	}
	for ( var i = 0, len = layers.length; i < len; i++) {
		var layer = layers[i];
		var baseLayer = layer.isBaseLayer;
		var vectorLayer = layer instanceof OpenLayers.Layer.Vector;

		if (layer.displayInLayerSwitcher) {

			if (baseLayer) {
				containsBaseLayers = true;
			} else {
				containsOverlays = true;
			}

			// only check a baselayer if it is *the* baselayer, check data
			// layers if they are visible
			var checked = (baseLayer) ? (layer == this.map.baseLayer) : layer
					.getVisibility();

			// create input element
			var inputElem = document.createElement("input");
			inputElem.id = this.id + "_input_" + layer.name;
			inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
			inputElem.type = (baseLayer) ? "radio" : "checkbox";
			inputElem.value = layer.name;
			inputElem.checked = checked;
			inputElem.defaultChecked = checked;
			inputElem.className = "olButton";
			inputElem._layer = layer.id;
			inputElem._layerSwitcher = this.id;
			inputElem.style.float = "left";
			inputElem.style.marginRight = "5px";

			if (!baseLayer && !layer.inRange) {
				inputElem.disabled = true;
			}

			// create span
			var labelSpan = document.createElement("label");
			labelSpan["for"] = inputElem.id;
			OpenLayers.Element.addClass(labelSpan, "labelSpan olButton");
			labelSpan._layer = layer.id;
			labelSpan._layerSwitcher = this.id;
			if (!baseLayer && !layer.inRange) {
				labelSpan.style.color = "gray";
			}
			labelSpan.innerHTML = (vectorLayer) ? layer.name + " - 热点"
					: layer.name;
			labelSpan.style.verticalAlign = (baseLayer) ? "bottom" : "baseline";
			labelSpan.style.float = "left";
			// create line break
			var p = document.createElement("p");
			p.style.clear = "both";

			var groupArray = (baseLayer) ? this.baseLayers : this.dataLayers;
			groupArray.push({
				'layer' : layer,
				'inputElem' : inputElem,
				'labelSpan' : labelSpan
			});

			var groupDiv = (baseLayer) ? this.baseLayersDiv
					: this.dataLayersDiv;
			p.appendChild(inputElem);
			p.appendChild(labelSpan);
			groupDiv.appendChild(p);
		}
	}

	// if no overlays, dont display the overlay label
	this.dataLbl.style.display = (containsOverlays) ? "" : "none";

	// if no baselayers, dont display the baselayer label
	this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";

	return this.div;
};
