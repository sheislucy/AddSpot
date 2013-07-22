MyPanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoomBar, {

	CLASS_NAME : "MyPanZoomBar"
});

MyPanZoomBar.prototype.zoomStopHeight = 45;

MyPanZoomBar.prototype._addButton = function(id, imgLocation, xy, sz) {
	var btn = OpenLayers.Util.createAlphaImageDiv(this.id + "_" + id, xy, sz,
			imgLocation, "absolute");
	btn.style.cursor = "pointer";
	// we want to add the outer div
	this.div.appendChild(btn);
	btn.action = id;
	btn.className = "olButton";

	// we want to remember/reference the outer div
	this.buttons.push(btn);
	return btn;
};

MyPanZoomBar.prototype.draw = function(px) {
	// initialize our internal div
	OpenLayers.Control.prototype.draw.apply(this, arguments);
	px = this.position.clone();

	// place the controls
	this.buttons = [];

	var largesz = {
		w : 54,
		h : 18
	};
	var smallsz = {
		w : 27,
		h : 18
	};
	var centered = new OpenLayers.Pixel(px.x + largesz.w / 2, px.y);

	var dir = web_context + "/images/material/";

	this._addButton("panup", dir + "north-mini.png", centered, largesz);
	px.y = centered.y + largesz.h;
	this._addButton("panleft", dir + "west-mini.png", px.add(smallsz.w, 0),
			smallsz);

	this._addButton("panright", dir + "east-mini.png", px.add(largesz.w, 0),
			smallsz);
	this._addButton("pandown", dir + "south-mini.png", centered.add(0,
			smallsz.h * 2), largesz);

	var sz = {
		w : 18,
		h : 18
	};
	this._addButton("zoomin", dir + "zoom-plus-mini.png", centered.add(sz.w,
			sz.h * 3 + 5), sz);
	centered = this._addZoomBar(centered.add(sz.w, sz.h * 4 + 5));
	this._addButton("zoomout", dir + "zoom-minus-mini.png", centered.add(0,
			-(sz.h + 16)), sz);
	return this.div;
};

MyPanZoomBar.prototype._addZoomBar = function(centered) {
	var imgLocation = web_context + "/images/material/slider.png";
	var id = this.id + "_" + this.map.id;
	var zoomsToEnd = this.map.getNumZoomLevels() - this.map.getZoom() - 1;
	var slider = OpenLayers.Util.createAlphaImageDiv(id, centered.add(0,
			zoomsToEnd * this.zoomStopHeight), {
		w : 18,
		h : 10
	}, imgLocation, "absolute");
	slider.style.cursor = "move";
	this.slider = slider;

	this.sliderEvents = new OpenLayers.Events(this, slider, null, true, {
		includeXY : true
	});
	this.sliderEvents.on({
		"touchstart" : this.zoomBarDown,
		"touchmove" : this.zoomBarDrag,
		"touchend" : this.zoomBarUp,
		"mousedown" : this.zoomBarDown,
		"mousemove" : this.zoomBarDrag,
		"mouseup" : this.zoomBarUp
	});

	var sz = {
		w : this.zoomStopWidth,
		h : this.zoomStopHeight * (this.map.getNumZoomLevels() - 1) + 11
	};
	var imgLocation = web_context + "/images/material/zoombar.png";
	var div = null;

	if (OpenLayers.Util.alphaHack()) {
		var id = this.id + "_" + this.map.id;
		div = OpenLayers.Util.createAlphaImageDiv(id, centered, {
			w : sz.w,
			h : this.zoomStopHeight
		}, imgLocation, "absolute", null, "crop");
		div.style.height = sz.h + "px";
	} else {
		div = OpenLayers.Util.createDiv('OpenLayers_Control_PanZoomBar_Zoombar'
				+ this.map.id, centered, sz, imgLocation);
	}
	div.style.cursor = "pointer";
	div.className = "olButton";
	this.zoombarDiv = div;

	this.div.appendChild(div);

	this.startTop = parseInt(div.style.top);
	this.div.appendChild(slider);

	this.map.events.register("zoomend", this, this.moveZoomBar);

	centered = centered.add(0, this.zoomStopHeight
			* this.map.getNumZoomLevels());
	return centered;
};