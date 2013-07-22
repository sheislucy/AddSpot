function adjustCenterSize(){
//	$("#jqGrid-people").setGridWidth($(".ui-layout-center")[0].clientWidth - 15);
	$("#jqGrid-people").setGridWidth($("#search-criteria").width());
	$("#search-result").height($(".ui-layout-center")[0].clientHeight - $("#search-criteria").height() - 60);
	$("#jqGrid-people").setGridHeight($(".ui-layout-center")[0].clientHeight - $("#search-criteria").height() - 113);
}

function adjustAccordionSize(){
	$("#treeMenu").accordion("refresh");
}

function adjustAll(){
	adjustCenterSize();
	adjustAccordionSize();
}

AjaxLoading = function() {
	this.showLoadingOverlay = function() {
		if( $(".overlay-wrapper")&& $(".overlay-wrapper").length > 0 ){
			$(".overlay-wrapper").show();
		}else{
			var wrapper = $('<div class="overlay-wrapper"></div>');
			var overlay = $('<div class="ui-widget-overlay"></div>');
			if ($.browser.chrome){
				var loadingIcon = $('<div class="bubblingG"></div>');
				for ( var i = 1; i < 4; i++) {
					var bubbling = $('<span id="bubblingG_' + i + '"></span>');
					loadingIcon.append(bubbling);
				}
				wrapper.append(overlay);
				wrapper.append(loadingIcon);
			}else {
				var loadingIcon = $('<div class="circleLoading"></div>');
				wrapper.append(overlay);
				wrapper.append(loadingIcon);
			}
			$(document.body).append(wrapper);
		}
	};
	
	this.hideLoadingOverlay = function(){
		$(".overlay-wrapper").hide();
	};
	$(function() {
		$(document.body).ajaxStart(function() {
			AjaxLoading.showLoadingOverlay();
		});
		$(document.body).ajaxStop(function() {
			AjaxLoading.hideLoadingOverlay();
		});
	});
};

AjaxLoading = new AjaxLoading();