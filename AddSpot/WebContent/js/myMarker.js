MyMarker = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {

	initialize : function(id, lonlat, contentSize, contentHTML, anchor,
			closeBox, closeBoxCallback, imageUrl) {
		this.imageSrc = imageUrl;
		OpenLayers.Popup.Framed.prototype.initialize.apply(this, arguments);
		this.contentDiv.className = this.contentDisplayClass;
	},

	CLASS_NAME : "MyMarker"
});

MyMarker.prototype.imageSize = new OpenLayers.Size(300, 220);

MyMarker.prototype.createBlocks = function() {
	this.blocks = [];
	var block = {};
	var divId = this.id + '_FrameDecorationDiv';
	block.div = OpenLayers.Util.createDiv(divId, null, null, null, "absolute",
			"1px solid #aaa", "hidden", 0.6);
	block.div.style.cssText = "background: #f5f5f5; border: 1px solid #aaa; opacity: 0.7;";
	if (this.imageSrc && this.imageSrc.length > 0) {
		var imgId = this.id + '_FrameDecorationImg';
		block.image = OpenLayers.Util.createImage(imgId, null, this.imageSize,
				this.imageSrc, "absolute", null, null, null);
		block.div.appendChild(block.image);
	}
	this.blocks.push(block);
	this.groupDiv.appendChild(block.div);
};

MyMarker.prototype.updateBlocks = function() {
	if (!this.blocks) {
		this.createBlocks();
	}

	if (this.size && this.relativePosition) {
		var position = this.positionBlocks[this.relativePosition];
		var positionBlock = position.blocks[0];

		// adjust sizes
		var l = positionBlock.anchor.left;
		var b = positionBlock.anchor.bottom;
		var r = positionBlock.anchor.right;
		var t = positionBlock.anchor.top;

		var block = this.blocks[0];

		var w = (isNaN(positionBlock.size.w)) ? this.size.w - (r + l)
				: positionBlock.size.w;

		var h = (isNaN(positionBlock.size.h)) ? this.size.h - (b + t)
				: positionBlock.size.h;

		block.div.style.width = (w < 0 ? 0 : w) + 10 + 'px';
		block.div.style.height = (h < 0 ? 0 : h) + 'px';

		block.div.style.left = (l != null) ? l + 'px' : '';
		block.div.style.bottom = (b != null) ? b + 'px' : '';
		block.div.style.right = (r != null) ? r + 'px' : '';
		block.div.style.top = (t != null) ? t + 'px' : '';

		if (block.image) {
			block.image.style.left = positionBlock.position.x + 'px';
			block.image.style.top = positionBlock.position.y + 'px';
			block.image.style.width = block.div.style.width;
			block.image.style.height = block.div.style.height;
			block.image.style.opacity = 0.9;
		}

		this.contentDiv.style.left = this.padding.left + "px";
		this.contentDiv.style.top = "8px";
	}
};

MyMarker.prototype.positionBlocks = {
	"tl" : {
		'offset' : new OpenLayers.Pixel(44, 0),
		'padding' : new OpenLayers.Bounds(12, 20, 4, 8),
		'blocks' : [ { // top-left
			size : new OpenLayers.Size('auto', 'auto'),
			anchor : new OpenLayers.Bounds(0, 26, 11, 0),
			position : new OpenLayers.Pixel(0, 0)
		}, { // top-right
			size : new OpenLayers.Size(22, 'auto'),
			anchor : new OpenLayers.Bounds(null, 25, 0, 0),
			position : new OpenLayers.Pixel(-1238, 0)
		}, { // bottom-left
			size : new OpenLayers.Size('auto', 19),
			anchor : new OpenLayers.Bounds(0, 16, 11, null),
			position : new OpenLayers.Pixel(0, -631)
		}, { // bottom-right
			size : new OpenLayers.Size(22, 18),
			anchor : new OpenLayers.Bounds(null, 16, 0, null),
			position : new OpenLayers.Pixel(-1238, -632)
		}, { // stem
			size : new OpenLayers.Size(81, 35),
			anchor : new OpenLayers.Bounds(null, 0, 0, null),
			position : new OpenLayers.Pixel(0, -688)
		} ]
	},
	"tr" : {
		'offset' : new OpenLayers.Pixel(-45, 0),
		'padding' : new OpenLayers.Bounds(12, 20, 4, 8),
		'blocks' : [ { // top-left
			size : new OpenLayers.Size('auto', 'auto'),
			anchor : new OpenLayers.Bounds(0, 26, 11, 0),
			position : new OpenLayers.Pixel(0, 0)
		}, { // top-right
			size : new OpenLayers.Size(22, 'auto'),
			anchor : new OpenLayers.Bounds(null, 25, 0, 0),
			position : new OpenLayers.Pixel(-1238, 0)
		}, { // bottom-left
			size : new OpenLayers.Size('auto', 19),
			anchor : new OpenLayers.Bounds(0, 16, 11, null),
			position : new OpenLayers.Pixel(0, -631)
		}, { // bottom-right
			size : new OpenLayers.Size(22, 19),
			anchor : new OpenLayers.Bounds(null, 16, 0, null),
			position : new OpenLayers.Pixel(-1238, -631)
		}, { // stem
			size : new OpenLayers.Size(81, 35),
			anchor : new OpenLayers.Bounds(0, 0, null, null),
			position : new OpenLayers.Pixel(-215, -687)
		} ]
	},
	"bl" : {
		'offset' : new OpenLayers.Pixel(45, 0),
		'padding' : new OpenLayers.Bounds(12, 3, 4, 25),
		'blocks' : [ { // top-left
			size : new OpenLayers.Size('auto', 'auto'),
			anchor : new OpenLayers.Bounds(0, 10, 11, 16),
			position : new OpenLayers.Pixel(0, 0)
		}, { // top-right
			size : new OpenLayers.Size(22, 'auto'),
			anchor : new OpenLayers.Bounds(null, 11, 0, 16),
			position : new OpenLayers.Pixel(-1238, 0)
		}, { // bottom-left
			size : new OpenLayers.Size('auto', 21),
			anchor : new OpenLayers.Bounds(0, 0, 11, null),
			position : new OpenLayers.Pixel(0, -629)
		}, { // bottom-right
			size : new OpenLayers.Size(22, 21),
			anchor : new OpenLayers.Bounds(null, 0, 0, null),
			position : new OpenLayers.Pixel(-1238, -629)
		}, { // stem
			size : new OpenLayers.Size(81, 33),
			anchor : new OpenLayers.Bounds(null, null, 0, 0),
			position : new OpenLayers.Pixel(-101, -674)
		} ]
	},
	"br" : {
		'offset' : new OpenLayers.Pixel(-44, 0),
		'padding' : new OpenLayers.Bounds(12, 3, 4, 25),
		'blocks' : [ { // top-left
			size : new OpenLayers.Size('auto', 'auto'),
			anchor : new OpenLayers.Bounds(0, 11, 11, 16),
			position : new OpenLayers.Pixel(0, 0)
		}, { // top-right
			size : new OpenLayers.Size(22, 'auto'),
			anchor : new OpenLayers.Bounds(null, 11, 0, 16),
			position : new OpenLayers.Pixel(-1238, 0)
		}, { // bottom-left
			size : new OpenLayers.Size('auto', 21),
			anchor : new OpenLayers.Bounds(0, 0, 11, null),
			position : new OpenLayers.Pixel(0, -629)
		}, { // bottom-right
			size : new OpenLayers.Size(22, 21),
			anchor : new OpenLayers.Bounds(null, 0, 0, null),
			position : new OpenLayers.Pixel(-1238, -629)
		}, { // stem
			size : new OpenLayers.Size(81, 33),
			anchor : new OpenLayers.Bounds(0, null, null, 0),
			position : new OpenLayers.Pixel(-311, -674)
		} ]
	}
};