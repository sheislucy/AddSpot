var ChartFactory = function() {

	this.generate3DColumn = function(chartId, width, height) {
		if (!chartId || chartId == 1 || chartId == "1") {
			var chart = new FusionCharts("../js/Fusion/MSColumn3D.swf",
					"chartId", width, height, "0", "0");
			chart.setJSONUrl("../js/chartDummyData/dummy.Column3D.json");
			chart.render("dummyChart");
		} else if (chartId == 2 || chartId == "2") {
			var chart = new FusionCharts("../js/Fusion/Doughnut3D.swf",
					"chartId", width, height, "0", "0");
			chart.setJSONUrl("../js/chartDummyData/dummy.Donut3D.json");
			chart.render("dummyChart");
		} else if (chartId == 3 || chartId == "3") {
			var chart = new FusionCharts("../js/Fusion/ZoomLine.swf",
					"chartId", width, height, "0", "0");
			chart.setJSONUrl("../js/chartDummyData/dummy.zoomLine.json");
			chart.render("dummyChart");
		}
	};
};

var cFactory = new ChartFactory();