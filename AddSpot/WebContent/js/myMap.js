var Feature = OpenLayers.Feature.Vector;
var Geometry = OpenLayers.Geometry;
var Map = OpenLayers.Map;
var Image = OpenLayers.Layer.Image;
var Rule = OpenLayers.Rule;
var Filter = OpenLayers.Filter;
var web_context = "..";

// Point feature generator -------------start----------
var FeatureManager = function() {
};

FeatureManager.prototype.genPoints = function(coordinates) {
	var features = new Array();
	for ( var i = 0, len = coordinates.length; i < len; i++) {
		var x = coordinates[i].x;
		var y = coordinates[i].y;
		var feature = new Feature(new Geometry.Point(x, y), {
			styleClass : "pointDefault",
			dbFeatureId : coordinates[i].featureId
		});
		features.push(feature);
	}
	return features;
};

/**
 * zones:[{ zone:[{x,y}] }]
 * 
 * @returns {Array}
 */
FeatureManager.prototype.genPolygon = function(zones, featureId) {
	var lonlatStr = "POLYGON(";
	for ( var i = 0; i < zones.length; i++) {
		var zone = zones[i];
		lonlatStr += "(";
		for ( var j = 0; j < zone.length; j++) {
			lonlatStr += zone[j].x;
			lonlatStr += " ";
			lonlatStr += zone[j].y;
			if (j != zone.length - 1) {
				lonlatStr += ", ";
			}
		}
		lonlatStr += ")";
		if (i != zones.length - 1) {
			lonlatStr += ", ";
		}
	}
	lonlatStr += ")";
	var polygon = new Feature(Geometry.fromWKT(lonlatStr), {
		styleClass : "zoneDefault",
		dbFeatureId : featureId
	});
	return polygon;
};

// Point feature generator -------------end----------
var featureMgr = new FeatureManager();
//announce controller of the map
var drawControls = {};
var highlightCtrlr;
var selectCtrlr;
var naviCtrlr;

var defaultStyle;
var selectStyle;
// map generator-----------start--------------
var MapManager = function() {
};

/**
 * mapMeta:{ view_width:"", view_height:"", mapName:"", mapImageUrl:"", mapId:"" }
 * 
 * hotspotMeta:{ points:[{x:"",y:"", featureId:""}], 
 * 
 * polygons:[{polygon: [{polygon_unit: [{x: "", y: ""}]}], featureId:""}], 
 * 
 * lines: [{line: [{x:"",y:"", featureId:""}], featureId:""}] }
 * 
 */
MapManager.prototype.genMap = function(mapMeta, hotspotMeta) {
	if (this.map) {
		this.map.destroy();
	}
	this.map = new Map('explore-map', {
		projection : "EPSG:3857",
		controls : [],
		fractionalZoom : true
	});
	this.dbMapId = mapMeta.mapId;
	this.map.layers = new Array();

	var options = {
		numZoomLevels : 6,
		layers: 'basic'
	};
	var graphic1 = new Image(mapMeta.mapName,
			web_context + mapMeta.mapImageUrl, new OpenLayers.Bounds(0, 0,
					mapMeta.view_width, mapMeta.view_height),
			new OpenLayers.Size(mapMeta.view_width, mapMeta.view_height),
			options);

	var CoordinateTranslator = function() {
		this.coo = {};
	};

	CoordinateTranslator.prototype.translate = function(minBase_x, minBase_y) {
		this.coo = {};
		this.coo.x = minBase_x * mapMeta.view_width / 903; // minimum width of
		// div#explore-map
		this.coo.y = minBase_y * mapMeta.view_height / 1277.3080645161292; // minimum
		// height
		// of
		// div#explore-map
		return this.coo;
	};

	var ct = new CoordinateTranslator();

	var points = new Array();
	if (hotspotMeta.points && hotspotMeta.points.length > 0) {
		for ( var i = 0; i < hotspotMeta.points.length; i++) {
			// var point = ct.translate(hotspotMeta.points[i].x,
					// hotspotMeta.points[i].y);
			var point = {x: hotspotMeta.points[i].x, y: hotspotMeta.points[i].y};
			point.featureId = hotspotMeta.points[i].featureId;
			points.push(point);
		}
	}

	var polygons_con = new Array();
	if (hotspotMeta.polygons && hotspotMeta.polygons.length > 0) {
		for ( var i = 0; i < hotspotMeta.polygons.length; i++) {
			// one single polygon here, but can contain holes
			var zones_con = new Array();
			var polygon = hotspotMeta.polygons[i];
			for ( var j = 0; j < polygon.polygon.length; j++) {
				// one single zone here
				var coordinates_con = new Array();
				var zones = polygon.polygon[j];
				for ( var k = 0; k < zones.zones.length; k++) {
					// one point coordinate here
					coordinates_con.push(ct.translate(zones.zones[k].x,
							zones.zones[k].y));
				}
				zones_con.push(coordinates_con);
			}
			zones_con.featureId = polygon.featureId;
			polygons_con.push(zones_con);
		}
	}
	var polygonFeatures = new Array();
	for ( var i = 0; i < polygons_con.length; i++) {
		polygonFeatures.push(featureMgr.genPolygon(polygons_con[i],
				polygons_con[i].featureId));
	}

	defaultStyle = new OpenLayers.Style({
		pointRadius : 10,
		strokeWidth : 3,
		strokeOpacity : 0.6,
		strokeColor : "navy",
		fillColor : "#ffcc66",
		fillOpacity : 1
	}, {
		rules : [ new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "pointDefault"
			}),
			symbolizer : {
				pointRadius : 15,
				strokeWidth : 2,
				srokeColor : '#9C9C9C',
				externalGraphic : web_context + '/images/material/a20.png',
				graphicXOffset : -15,
				graphicYOffset : -30,
				cursor : "pointer"
			}
		}), new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "zoneDefault"
			}),
			symbolizer : {
				strokeWidth : 2,
				strokeOpacity : 0.6,
				strokeColor : "#00ffa5",
				fillColor : "#defaf9",
				fillOpacity : 0.4
			}
		}), new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "lineDefault"
			}),
			symbolizer : {
				strokeWidth : 5,
				strokeOpacity : 0.6,
				strokeColor : "#d21838"
			}
		}) ]
	});

	selectStyle = new OpenLayers.Style({
		fillColor : "red",
		pointRadius : 13,
		strokeColor : "yellow",
		strokeWidth : 3
	}, {
		rules : [ new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "pointDefault"
			}),
			symbolizer : {
				pointRadius : 15,
				strokeWidth : 2,
				srokeColor : '#9C9C9C',
				externalGraphic : web_context + '/images/material/a23.png',
				graphicXOffset : -15,
				graphicYOffset : -30,
				cursor : "pointer"
			}
		}), new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "zoneDefault"
			}),
			symbolizer : {
				strokeWidth : 2,
				strokeOpacity : 0.7,
				strokeColor : "#4be900",
				fillColor : "#defaf9",
				fillOpacity : 0.5,
				cursor : "pointer"
			}
		}), new Rule({
			filter : new Filter.Comparison({
				type : "==",
				property : "styleClass",
				value : "lineDefault"
			}),
			symbolizer : {
				strokeWidth : 5,
				strokeOpacity : 0.7,
				strokeColor : "#fd0392",
				cursor : "pointer"
			}
		}) ]
	});
	
	var vectorLayer = new OpenLayers.Layer.Vector("热点", {
		styleMap : new OpenLayers.StyleMap({
			"default" : defaultStyle,
			"select" : selectStyle
		}),
	});
	
	vectorLayer.addFeatures(featureMgr.genPoints(points));
	vectorLayer.addFeatures(polygonFeatures);
	
	var switcher = new MyLayerSwitcher({
		roundedCorner : false
	});	
	naviCtrlr = new OpenLayers.Control.Navigation();
	
	highlightCtrlr = new OpenLayers.Control.SelectFeature(vectorLayer, {
		hover : true,
		highlightOnly : true,
		renderIntent : "select",
		geometryTypes : ["OpenLayers.Geometry.Polygon", "OpenLayers.Geometry.LineString"]
	});
	// select points
	selectCtrlr = new OpenLayers.Control.SelectFeature(vectorLayer, {
		clickout : true
	});
	vectorLayer.events.on({
		'featureselected' : showMarker,
		'featureunselected' : hideMarker
	});
	
	drawControls = {
		point : new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.Point),
		line : new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.Path),
		freeformPolygon : new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.Polygon),
		polygon : new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.RegularPolygon)
	};
	
	drawControls.point.handler.callbacks.done = pointCtrlDone;
	drawControls.line.handler.callbacks.done = lineCtrlDone;
	drawControls.freeformPolygon.handler.callbacks.done = polygonCtrlDone;
	drawControls.polygon.handler.callbacks.done = polygonCtrlDone;

	this.map.addLayers([graphic1, vectorLayer]);
	this.map.addControls([ switcher, highlightCtrlr, selectCtrlr,
			new OpenLayers.Control.MousePosition(), new MyPanZoomBar(), 
			naviCtrlr, 
			drawControls.point, drawControls.line, drawControls.freeformPolygon, drawControls.polygon]);
	this.map.zoomToMaxExtent();
	this.map.events.register("mousemove", this.map, function(e) {
		mouseLonlat = e.object.getLonLatFromPixel(e.xy);
	});
	highlightCtrlr.activate();
	selectCtrlr.activate();
	
	OpenLayers.Event.observe(document, "keydown", function(evt) {
		if(drawControls.freeformPolygon.active === true){
			undoRedo(drawControls.freeformPolygon, evt);
		} else if (drawControls.line.active === true){
			undoRedo(drawControls.line, evt);
		} else if (selectCtrlr.active === true){
			removeFeature(selectCtrlr, evt);
		}
	});
	return selectCtrlr;
};

var removeFeature = function (selectCtrl, evt){
	if(evt.keyCode == OpenLayers.Event.KEY_BACKSPACE){
		$("#delete-confirm-dialog").selectCtrl = selectCtrl;
		$("#delete-confirm-dialog").dialog("open");
	}
};

var undoRedo = function (draw, evt){
	var handled = false;
	switch (evt.keyCode) {
	case 90: // z
		if (evt.metaKey || evt.ctrlKey) {
			draw.undo();
			handled = true;
		}
		break;
	case 89: // y
		if (evt.metaKey || evt.ctrlKey) {
			draw.redo();
			handled = true;
		}
		break;
	case 27: // esc
		draw.cancel();
		handled = true;
		break;
	}
	if (handled) {
		OpenLayers.Event.stop(evt);
	}
};

var polygonCtrlDone = function(geometry){
	var feature = new OpenLayers.Feature.Vector(geometry, {
		styleClass : "zoneDefault"
	});
	var proceed = this.handler.layer.events.triggerEvent("sketchcomplete", {
		feature : feature
	}); 

    if(proceed !== false) {
        feature.state = OpenLayers.State.INSERT;
        this.handler.control.layer.addFeatures([feature]);
        this.handler.control.featureAdded(feature);
        this.handler.control.events.triggerEvent("featureadded",{feature : feature});
    }
    
  //TODO show users overlay
};

var lineCtrlDone = function(geometry){
	var feature = new OpenLayers.Feature.Vector(geometry, {
		styleClass : "lineDefault"
	});
	var proceed = this.handler.layer.events.triggerEvent("sketchcomplete", {
		feature : feature
	}); 

    if(proceed !== false) {
        feature.state = OpenLayers.State.INSERT;
        this.handler.control.layer.addFeatures([feature]);
        this.handler.control.featureAdded(feature);
        this.handler.control.events.triggerEvent("featureadded",{feature : feature});
    }
    
  //TODO show users overlay
};

var pointCtrlDone = function(geometry){
	var feature = new OpenLayers.Feature.Vector(geometry, {
		styleClass : "pointDefault"
	});
	var proceed = this.handler.layer.events.triggerEvent("sketchcomplete", {
		feature : feature
	}); 

    if(proceed !== false) {
        feature.state = OpenLayers.State.INSERT;
        this.handler.control.layer.addFeatures([feature]);
        this.handler.control.featureAdded(feature);
        this.handler.control.events.triggerEvent("featureadded",{feature : feature});
    }
    
    $( "#point-people-dialog" ).dialog( "open" );
};

var switchToUnEditMode = function(){
	for(var key in drawControls) {
		drawControls[key].deactivate();
	}
	highlightCtrlr.activate();
	selectCtrlr.activate();
};

var switchToEditMode = function(mode){
	highlightCtrlr.deactivate();
	selectCtrlr.deactivate();
	for(var key in drawControls) {
		drawControls[key].deactivate();
	}
	
	switch(mode) {
		case "line":
			drawControls.line.handler.stopDown = true;
        	drawControls.line.handler.stopUp = true;
			drawControls.line.activate();
			break;
		case "point":
			drawControls.point.handler.stopDown = true;
        	drawControls.point.handler.stopUp = true;
			drawControls.point.activate();
			break;
		case "freeform":
			drawControls.freeformPolygon.handler.stopDown = true;
        	drawControls.freeformPolygon.handler.stopUp = true;
        	drawControls.freeformPolygon.holeModifier = "altKey";
			drawControls.freeformPolygon.activate();
			break;
		case "triangle":
			drawControls.polygon.handler.setOptions({sides: 3, irregular: true});
			drawControls.polygon.activate();
			break;
		case "regTriangle":
			drawControls.polygon.handler.setOptions({sides: 3, irregular: false});
			drawControls.polygon.activate();
			break;
		case "rectangle":
			drawControls.polygon.handler.setOptions({sides: 4, irregular: true});
			drawControls.polygon.activate();
			break;
		case "square":
			drawControls.polygon.handler.setOptions({sides: 4, irregular: false});
			drawControls.polygon.activate();
			break;
		case "pentagon":
			drawControls.polygon.handler.setOptions({sides: 5, irregular: true});
			drawControls.polygon.activate();
			break;
		case "regPentagon":
			drawControls.polygon.handler.setOptions({sides: 5, irregular: false});
			drawControls.polygon.activate();
			break;
		case "hexagon":
			drawControls.polygon.handler.setOptions({sides: 6, irregular: true});
			drawControls.polygon.activate();
			break;
		case "regHexagon":
			drawControls.polygon.handler.setOptions({sides: 6, irregular: false});
			drawControls.polygon.activate();
			break;
		case "oval":
			drawControls.polygon.handler.setOptions({sides: 40, irregular: true});
			drawControls.polygon.activate();
			break;
		case "circle":
			drawControls.polygon.handler.setOptions({sides: 40, irregular: false});
			drawControls.polygon.activate();
			break;
	}

};

var mouseLonlat = {};

var hideMarker = function(evt) {
	var feature = evt.feature;
	this.map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
};

var showMarker = function(evt) {
	var feature = evt.feature;
	var lonlat;
	var mouseLonlatOnClick = mouseLonlat;
	if (feature.geometry instanceof Geometry.Point) {
		lonlat = OpenLayers.LonLat.fromString(feature.geometry.toShortString());
	} else {
		lonlat = new OpenLayers.LonLat(mouseLonlatOnClick.lon,
				mouseLonlatOnClick.lat);
	}
	var map = this.map;
	
	if($("#dataParent").attr("value")=="p"){
		window.open("/people/houseMembers/" + 227);
	}else{
		var popup = new MyMarker("myPopup", lonlat,
				new OpenLayers.Size(70, 60), "规划用图",
				null, false, null, null);
		popup.minSize = new OpenLayers.Size(80, 60);
		popup.autoSize = true;
		feature.popup = popup;
		map.addPopup(popup);
	}
	
//	$.getJSON(web_context + '/map/' + "map03" + "/feature/"
//			+ feature.data.dbFeatureId + "/marker",
//			function(data) {
//				if (data && data.resultCode == 'SUCCESS') {
//					/*
//					 * var popup = new MyMarker("myPopup", lonlat, new
//					 * OpenLayers.Size( 260, 180), data.resultData, null, false,
//					 * null, web_context + "/images/material/marker03.png");
//					 */
//					var result = data.resultData;
//					var markerHTML = $("#markerTemplate").clone();
//					var memberHTML = $("#markerTemplate > #member").clone();
//					markerHTML.removeClass("hide");
//					markerHTML.find("#primary > #host > #content").html(
//							result.host);
//					markerHTML.find("#primary > #address > #content").html(
//							result.address);
//					markerHTML.find("#primary > #job > #content").html(
//							result.business);
//					markerHTML.remove("#member");
//					for ( var i = 0; i < result.members.length; i++) {
//						memberHTML.find("#relation > #content").html(
//								result.members[i].relation);
//						memberHTML.find("#name > #content").html(result.members[i].name);
//						memberHTML.find("#job > #content").html(result.members[i].job);
//						markerHTML.append(memberHTML);
//					}
//					var popup = new MyMarker("myPopup", lonlat,
//							new OpenLayers.Size(260, 180), markerHTML[0].outerHTML,
//							null, false, null, null);
//					popup.minSize = new OpenLayers.Size(260, 180);
//					popup.autoSize = true;
//					feature.popup = popup;
//					map.addPopup(popup);
//				}
//			});
};

// map generator-----------end--------------
var getMapAndHotSpot = function(mapId) {
	$.getJSON(web_context + '/map/' + mapId,{"dataParent": $("#dataParent").attr("value")}, function(data) {
		if (data && data.status == 'SUCCESS') {
			$('#explore-map').html("");
			var hotspotMeta = {};
			var mapMeta = data.resultData.mapMeta;
			hotspotMeta.points = data.resultData.points;
			hotspotMeta.polygons = data.resultData.polygons;

			// var map_width = $('#explore-map').innerWidth();
			// var map_height = map_width / mapMeta.width * mapMeta.height;
			// $('#explore-map').height(map_height);
			var map_height =$(".ui-layout-center")[0].clientHeight - $("#search-criteria").height()-10;
			$('#explore-map').height(map_height);
			var map_width = map_height / mapMeta.height * mapMeta.width;

			mapMeta.view_width = map_width;
			mapMeta.view_height = map_height;
			var mapManager = new MapManager();
			mapManager.genMap(mapMeta, hotspotMeta);
		}
	});
};

//---------------------dialog and init------------------
function updateTips( t ) {
    $(".validateTips").text( t ).addClass( "ui-state-highlight" );
  }

function checkNotNull( o, n ) {
    if ( o.val().length == 0 ) {
      o.addClass( "ui-state-error" );
      updateTips( n + "不允许为空"+ "." );
      return false;
    } else {
      return true;
    }
}

function initAll(){
	var lastPaintBrush;
	
	$("#controlRadio").buttonset();
	$("#shapeRadio").buttonset();
	$("#polygonRadio").buttonset();
	$('[for=cursor]').click(function(){
		if($(this).attr("aria-pressed") == "true"){
			switchToUnEditMode();
			$("#polygonRadio").hide("fast");
			$("#shapeRadio").hide("fast");
		}
	});
	$('[for=drawer]').click(function(){
		if($(this).attr("aria-pressed") == "true"){
			if(lastPaintBrush){
				lastPaintBrush.click();
			}
			$("#shapeRadio").show("fast");
			if($('[for=polygon]').attr("aria-pressed") == "true"){
				$("#polygonRadio").show("fast");
			}
		}
	});
	$('[for=point]').click(function(){
		if($(this).attr("aria-pressed") == "true"){
			switchToEditMode("point");
			$("#polygonRadio").hide("fast");
			lastPaintBrush = $(this);
		}
	});
	$('[for=line]').click(function(){
		if($(this).attr("aria-pressed") == "true"){
			switchToEditMode("line");
			$("#polygonRadio").hide("fast");
			lastPaintBrush = $(this);
		}
	});
	$('[for=polygon]').click(function(){
		if($(this).attr("aria-pressed") == "true"){
			$("#polygonRadio").show("fast");
		}
	});
	$('#polygonRadio > p > label').click(function(){
		switchToEditMode($(this).attr("for"));
		lastPaintBrush = $(this);
	});
	
	var mapManager = new MapManager();
	var selectCtrlr = mapManager.genMap({ view_width:"438", view_height:"620",mapId: "Map05",  mapName:"土地规划总图", mapImageUrl:"/images/Map05.jpg", }, 
			{ points:[{x:157, y:288, featureId: 1}]});
	
	$( "#point-people-dialog" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"完成": function() {
				if ( checkNotNull($("#peopleName"), "村民姓名") ) {
					//TODO AJAX
					$( this ).dialog( "close" );
				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			$("#remark").val("");
			$("#peopleName").val( "" ).removeClass( "ui-state-error" );
		}
	});
	
	$("#delete-confirm-dialog").dialog({
		autoOpen: false,
		resizable: false,
		height:140,
		modal: true,
		buttons: {
				"删除": function() {
				//TODO remove feature from map, need ajax here 
				var selectedFeature = selectCtrlr.handlers.feature.feature;
				selectCtrlr.map.removePopup(selectedFeature.popup);
				selectedFeature.popup.destroy();
				selectedFeature.popup = null;
				selectCtrlr.layer.removeFeatures([selectedFeature]);
				$( this ).dialog( "close" );
			},
				Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
}

