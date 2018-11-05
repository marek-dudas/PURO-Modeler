/**
 * @author marek_000
 */
function PuroView(width, height, viewingElement){
	this.width =  width;
	this.height = height;
	this.colors = d3.scale.category10();
    this.layoutRunning = false;
    
    this.viewingElement = d3.select("#"+viewingElement);
	    
	this.svg = this.viewingElement
		.append("svg")
		.attr("width", width)
		.attr("height", height);
		
		
	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'end-arrow')
	    //.attr('viewBox', '0 -5 10 10')
	    .attr('refX', 9.5)
	    .attr('refY', 6)
	    .attr('markerWidth', 13)
	    .attr('markerHeight', 13)
	    .attr('orient', 'auto')
  	.append('svg:path')
	    //.attr('d', 'M0,-5L10,0L0,5')
	    .attr('d', 'M2,2 L2,11 L10,6')
	    .style("fill", "#ccc");

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'start-arrow')
	    .attr('viewBox', '0 -5 10 10')
	    .attr('refX', 4)
	    .attr('markerWidth', 3)
	    .attr('markerHeight', 3)
	    .attr('orient', 'auto')
  	.append('svg:path')
    	.attr('d', 'M10,-5L0,0L10,5')
    	.attr('fill', '#000');
    	
    this.svg.append('svg:defs').append('filter')
    	.attr('id', 'blur-filter').append('feGaussianBlur')
    	.attr('stdDeviation',3);
    
    this.rootSvg = this.svg;	
    this.svg = this.svg.append("svg:g");
    
    	
	this.nodes = this.svg.append("svg:g").selectAll("g");
	this.edges = this.svg.append("svg:g").selectAll("line");
	this.linktext = this.svg.append("svg:g").selectAll("g.linklabelholder");
	
	if(PuroAppSettings.vocabComparisonEnabled) {
		this.vocabsDiv = d3.select("#"+vocabsDiv);
		this.vocabs = this.vocabsDiv.selectAll(".vocabBox");
	}
	
			// create the zoom listener
	var zoomListener = d3.behavior.zoom()
	  .scaleExtent([0.1, 2])
	  .on("zoom", zoomHandler);
	  //.on("dblclick.zoom", function(){});
	
	var mainG = this.svg;
	// function for handling zoom event
	function zoomHandler() {
		var scale = 1 - ( (1 - d3.event.scale) * 0.1 );
	  mainG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
			
	zoomListener(this.rootSvg);
	this.rootSvg.on("dblclick.zoom", null);
	
	var thisView = this;
	window.addEventListener('resize', function(event){
		  thisView.updateSize();
		});
	
	$(window).load(function () { thisView.updateSize(); });
	
	this.mappingChoices = null;
	this.mouseInCanvas = false;
};

PuroView.prototype.updateSize = function() {
	var currentSize = this.viewingElement.node().getBoundingClientRect();
	this.rootSvg.attr("width", currentSize.width - 12).attr("height", currentSize.height - 12);
	this.layout.size([currentSize.width-12, currentSize.height-12]);
};

PuroView.prototype.startLayout = function() {
	var thisView = this;
	this.tickCounter = 0;
	this.layout = d3.layout.force()
	    .size([this.width, this.height])
	    .nodes(this.model.nodes)
	    .links(this.model.links)
	    .linkDistance(150) //200
	    .charge(-1200) //-1500
	    .on("tick", function() {
	    	thisView.tick();	
	    	
	    });
	var forceLayout = this.layout;
	//this.layout.drag().on("dragstart", function() { d3.event.sourceEvent.stopPropagation();});
};

PuroView.prototype.decorateControls = function(toolBoxElement, puroControl){
	this.puroCtrl = puroControl;
	//d3.select("#"+buttons["setToolBType"]).on("mousedown", function(){
	//	puroControl.setTool(puroControl.TOOL.createBType);});
	
	this.createToolbox(toolBoxElement, puroControl);
			
	this.rootSvg.on("click", function(){
		puroControl.canvasMouseDown(d3.mouse(PuroEditor.view.svg.node()), null);
	});

	var view = this;
	
	this.rootSvg.on("mouseenter", function(){
		view.mouseInCanvas = true;});
	this.rootSvg.on("mouseleave", function(){
		view.mouseInCanvas = false;});
	
	if(PuroAppSettings.vocabComparisonEnabled) this.decorateVocabControls(puroControl);
	if(PuroAppSettings.obmToolboxEnabled) this.decorateEditorControls(puroControl);
	else {
		d3.select("#btnEdit").on("click", function(){puroControl.loadEditor();});
		d3.select("#btnVocabs").on("click", function(){puroControl.getMappings();});
	}
	if(PuroAppSettings.modelingStyleBoxEnabled) this.decorateModelingControls(puroControl);

	d3.select("#btnLayout").on("click", function(){
		if(view.layoutRunning) {
			view.layout.stop();
			view.layoutRunning = false;
		}
		else {
			view.layout.start();
			view.layoutRunning = true;
			for(var i=0; i<view.puroCtrl.model.nodes.length; i++) view.puroCtrl.model.nodes[i].fixed = false;
		}
	});
	
	d3.select("#btnLoadObmList").on("click", function(){
		view.updateOBMList(obmListTableElement);
	})
	d3.select("#btnLogout").on("click", function(){
		PuroEditor.logout();
	})
};

PuroView.prototype.decorateEditorControls = function(puroControl) {
	d3.select("#btnNew").on("click", function(){puroControl.newModel();});
	d3.select("#btnSave").on("click", function(){puroControl.saveModel();});
	d3.select("#btnSaveAs").on("click", function(){puroControl.saveModelAs();});
	d3.select("#btnTransform").on("click", function(){puroControl.transformModel();});
	d3.select("#btnMorph").on("click", function(){puroControl.loadMorph();});
};

PuroView.prototype.decorateVocabControls = function(puroControl) {
	d3.select("#btnAddVocab").on("click", function(){puroControl.newVocab();});
	d3.select("#btnRemoveVocab").on("click", function(){puroControl.delVocab();});	
};

PuroView.prototype.decorateModelingControls = function(puroControl) {
	this.modelingChoices = d3.select("#modelingStyles").selectAll(".modelingStyle").data(ModelingStyles);
	var choicesDivs = this.modelingChoices.enter().append("div").classed("modelingStyle",true);
	choicesDivs.append("input")
		.attr("type", "radio")
		.attr("name", "modelingChoice")
		.attr("value", function(d) {return d.name;})
		.on("click", function(d) {puroControl.modelingStyleChanged(d, d3.select(this).node().checked);});
	choicesDivs.append("span").text(function(d) {return d.label;});
	this.perdurantChBox = d3.select("#chbPerdurant");
	this.perdurantChBox.on("click", function() {puroControl.temporalityChanged(d3.select(this).node().checked)});
	d3.select("#btnUpdateOWL").on("click", function(){puroControl.updateOFM();});
};

PuroView.prototype.updateOBMList = function(listElement) {
	if(listElement!=null) this.obmListElement = listElement;
	this.puroCtrl.getOBMs();
};
	
PuroView.prototype.fillOBMList = function(obms) {
	var table = d3.select("#"+this.obmListElement);
	table.selectAll("tr").remove();
	var ctrl = this.puroCtrl;
	for(var i=0; i<obms.length; i++) {
		//var obm = this.purobms[i].doc
		var tr = table.append("tr");
		tr.append("td").append("input")
		.classed("button", true)
		.attr("id",obms[i]._id)
		.attr("type","button")
		.attr("value", obms[i].name+" by "+obms[i].author)
		.on("click", function(){
			ctrl.loadModel(this.id);});
		tr.append("td").attr("align", "right")
		.append("input")
		.classed("button", true)
		.attr("modelid",obms[i]._id)
		.attr("modelname", obms[i].name)
		.attr("type", "button")
		.attr("value", "x")
		.on("click", function() {
			var confirmation = true;
			if(this.attributes.modelname) confirmation = confirm("Do you really want to delete model "+this.attributes.modelname.value+"?");
			var idToDelete = this.attributes.modelid.value;
			if(confirmation) ctrl.deleteModel(idToDelete);
		});
	}
	this.updateSize();
};

PuroView.prototype.setData = function(model) {
	this.model = model;
	this.startLayout();
};

PuroView.prototype.tick = function() {
	if(this.model.links.length>0 && this.edges.length>0){
		this.edges.attr("x1", function(d) { d.countStartFromIntersection(); return d.startX; })
	     .attr("y1", function(d) { return d.startY; })
	     .attr("x2", function(d) { d.countEndFromIntersection(); return d.endX;})
	     .attr("y2", function(d) { return d.endY; });
	     
	    this.linktext.attr('transform', function(d) {
	    	p = d.getMiddlePoint();
    		return 'translate(' + p.x + ',' + p.y + ')';}); 
    }
    
    if(this.model.nodes.length>0 && this.nodes.length>0){
		/*this.nodes.attr("cx", function(d) { 
			return d.x; })
	     .attr("cy", function(d) { 
	     	return d.y; });*/
	    this.nodes.attr('transform', function(d) {
    		return 'translate(' + d.x + ',' + d.y + ')';
  		});
    }
    
    if(PuroAppSettings.vocabComparisonEnabled) {
	    if(this.tickCounter >= vocabHighlightUpdateRate) {
	    	this.drawVocabPaths();
	    	this.tickCounter = 0;
	    }
	    this.tickCounter++;
    }
};

PuroView.prototype.setDraggedNode = function(node) {
	
	this.dragSvg = d3.select("body").append("svg").style("position", "absolute")
				.style("z-index", 1000)
				.attr("overflow", "visible")
				.attr("width", node.width)
				.attr("height", node.height);
	
	this.dragButton = this.dragSvg.append("g").classed("node",true);
	
	var button = this.dragButton.append("path").attr("d", node.getPathData());
			//if(specialColor != null) button.style("fill", specialColor);
	this.dragButton.append("text").text(node.name)
		.attr("text-anchor", "middle")
		.attr("x", "0") //width/2+5)
		.attr("y","0")
	     .attr("dx", 1)
	     .attr("dy", ".35em");
  		//.style("font-size", Math.min(node.width, (node.width - 8) 
  		//	/ button.getComputedTextLength() * 12) + "px");
	
	var w = d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

	d3.event.preventDefault(); // disable text dragging
	
	function mousemove() {
		PuroEditor.view.dragSvg.style("left", d3.mouse(d3.select("body").node())[0]+"px").style("top", d3.mouse(d3.select("body").node())[1]+"px");
	}
	
	function mouseup() {
		 w.on("mousemove", null).on("mouseup", null);
		 PuroEditor.view.dragSvg.remove();
		 var mousePos = d3.mouse(PuroEditor.view.viewingElement.node());
		 if(mousePos[0]>0 && mousePos[0]<PuroEditor.view.width && mousePos[1]>0 && mousePos[1]<PuroEditor.view.height) PuroEditor.control.canvasMouseDown(d3.mouse(PuroEditor.view.svg.node()));

		 PuroEditor.control.setTool(PuroEditor.control.TOOL.select);
	}
}

PuroView.prototype.updateToolHighlights = function() {
	for(var i=0; i<this.buttonsArray.length; i++) {
		var button = this.buttonsArray[i];
		button.classed("selected", false);
		if(button.tool == this.puroCtrl.activeTool) button.classed("selected", true);
	};
}

PuroView.prototype.updateView = function() {
	
	this.updateToolHighlights();
	   
    var puroControl = this.puroCtrl;
    
    this.edges = this.edges.data(this.model.links, function(d) {return d.id;});    
    
	this.edges.enter()
	        .append("line")
	        .style("stroke", function(d) {return (d.errors.hasError)?"#f00":"#ccc";})
	        .style("stroke-width", 2)
		    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
		    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
		    .style("stroke-dasharray", function(d) {return d.dashed();});
		    
		    
	this.linktext = this.linktext.data(this.model.links, function(d) {return d.id;});
    var linktextEnter =this.linktext.enter().append("g").attr("class", "linklabelholder")
	        .on("mousedown", function(d){
	        	puroControl.canvasMouseDown(d3.mouse(this), d);}
	        )
     .on('dblclick', function(d){
			     puroControl.nodeDblClick(d);
			      var text = d3.select(this).select("text")[0][0];
    			  text.selectSubString(0,0);
    	});
     linktextEnter.append("text")
     .attr("class", "linklabel")
     .attr("dx", 1)
     .attr("dy", ".35em")
     .attr("text-anchor", "middle")
     .text(function(d) { return d.name; });
     linktextEnter.append("path")
	        .attr("d", BTypePath(80,40))
	        .attr("class", "hiddenPath");
    
    this.linktext.selectAll(".linklabelholder text").text(function(d) { return d.name; });
    
    //if(this.model.getNodes().length>0){  
    	this.edges.exit().remove();
    	this.linktext.exit().remove();
    	  
    	var canvasSvg = this.svg;
	    this.nodes = this.nodes.data(this.model.nodes, function(d) {return d.id;});  
	    
	    var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        
        var view = this;

	    function dragstart(d, i) {
	        view.layout.stop(); // stops the force auto positioning before you start dragging
	        d3.event.sourceEvent.stopPropagation();
	    }
	
	    function dragmove(d, i) {
	        d.px += d3.event.dx;
	        d.py += d3.event.dy;
	        d.x += d3.event.dx;
	        d.y += d3.event.dy; 
	        view.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
	    }
	
	    function dragend(d, i) {
	        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
	        view.tick();
	        if(view.layoutRunning) view.layout.resume();
	        if(PuroAppSettings.vocabComparisonEnabled) view.drawVocabPaths();
	    }
	    
	    //this.nodes.enter()
	    var nodesEnter = this.nodes.enter().append("g")
	        .on("click", function(d){
		        d3.event.stopPropagation();
	        	puroControl.canvasMouseDown(d3.mouse(this), d);
	        	if(PuroAppSettings.modelingStyleBoxEnabled) d3.select("#nodeProps").style("left", (d3.event.clientX+30)+"px").style("top", (d3.event.clientY+30)+"px");
	        	if(PuroAppSettings.mappingBoxEnabled) 
	        		d3.select("#nodeMappings")
	        		.style("left", (d3.event.clientX+30)+"px")
	        		.style("top", (d3.event.clientY+180)+"px")
	        		.style("height", (d.mappings.length*16+30)+"px");
	        	    d3.select("#mappingInfoWindow")
	        		.style("left", (d3.event.clientX+290)+"px")
	        		.style("top", (d3.event.clientY+180)+"px");  	    
	     
	        	})
	        .on('dblclick', function(d){
			     puroControl.nodeDblClick(d);
			      var text = d3.select(this).select("text")[0][0];
    			  text.selectSubString(0,0);
    			})    			
	        .call(node_drag)
	        .classed("node",true)
	        .classed("mapping",function(d){return d.getType()=="mapping"});
	        //.append("circle")
	        //.attr("r", 10)
	    nodesEnter.append("path")
	        .attr("d", function(d) {
	        	return d.getPathData();});
	        //.style("fill", "#ccc");
	        
	    nodesEnter.append("text")
	    	.classed("nodename", true)
	    	.text(function(d) { return d.name; })	    	
      		.style("font-size", function(d) { 
      			return Math.max(Math.min(16, Math.min(d.width, (d.width - 8) 
      			/ this.getComputedTextLength() * 14)), 13) + "px"; })      			
			.attr("x","0")//function(d) {return d.width/2+2;})
			.attr("y","0") 
		     .attr("dx", 1)
		     .attr("dy", ".35em");
		     
		 nodesEnter.append("text")
		 	.classed("typelabel", true)
		 	.text(function(d) { return d.getType();})
		 	.attr("x", function(d) {return d.width/2;})
		 	.attr("y", function(d) {return -d.height/2-8;})
		 	.attr("fill", "#ccc");
		 	
		 this.nodes.selectAll(".typelabel").text(function(d) {return d.getType();});   
		 this.nodes.selectAll(".nodename").text(function(d) {return d.name;});
		 this.nodes.selectAll("title").remove();
		 this.nodes.selectAll("path").classed("selected", function(d) {return d.selected;})
		    .style("stroke", function(d) {return (d.errors.hasError())?"#f00":"#ccc";})
		    .append("title").text(function(d) {return d.errors.getMessage();});	        	
		 this.linktext.selectAll("title").remove();
		 this.edges.style("stroke", function(d) {return (d.errors.hasError())?"#f00":"#ccc";});
		 this.linktext.append("title").text(function(d) {return d.errors.getMessage();});	        	
		this.nodes.exit().remove();
    
	if(PuroAppSettings.vocabComparisonEnabled) this.updateVocabList(puroControl);
	if(PuroAppSettings.modelingStyleBoxEnabled) this.updateNodeModelingProps(puroControl);
        
    d3.select("#modelname").text(this.model.name);
    d3.select("#spanModified").text(this.model.lastModified);
    
    if(this.layoutRunning) this.layout.start();
    this.tick();
    
    if(PuroAppSettings.vocabVisualizationEnabled) this.drawVocabPaths();
};

PuroView.prototype.updateNodeModelingProps = function(puroControl) {
	var nodePropsDiv = d3.select("#nodeProps");
	var nodeMappingsDiv = d3.select("#nodeMappings");
	if(puroControl.selectedNode==null) 
		{
			nodePropsDiv.style("visibility", "hidden");
			nodeMappingsDiv.style("visibility", "hidden");			
		}
	else { 
		nodePropsDiv.style("visibility","visible");
		this.modelingChoices.selectAll("input").property("checked", function(d) {return d.selected;});
		this.perdurantChBox.property("checked", puroControl.selectedNode.perdurant);
		
		if(! (puroControl.selectedNode instanceof BObject || puroControl.selectedNode instanceof BValuation)){
			nodeMappingsDiv.style("visibility", "visible");	
			if(this.mappingChoices != null) this.mappingChoices.remove();
			this.mappingChoices = d3.select("#mappingChoices").selectAll(".mappingChoice").data(puroControl.selectedNode.mappings);
			var choicesDivs = this.mappingChoices.enter().append("div").classed("mappingChoice",true);
			choicesDivs.append("input")
				.attr("type", "radio")
				.attr("name", "mappingChoice")
				.attr("value", function(d) {return d.getLabel();})
				.on("click", function(d) {puroControl.mappingChanged(d, d3.select(this).node().checked);});
			choicesDivs.append("span").text(function(d) {return d.getLabel();})
				.on("mouseover", function(d) {puroControl.showMappingInfo(d);})
				.on("mouseleave", function(d) {puroControl.hideMappingInfo();});
			this.mappingChoices.exit().remove();
			
			this.mappingChoices.selectAll("input").property("checked", function(d) {return d.selected;});
		}
		else {
			nodeMappingsDiv.style("visibility", "hidden");	
			if(this.mappingChoices != null) this.mappingChoices.remove();
		}
	}	
}

PuroView.prototype.updateVocabList = function(puroControl) {
	this.vocabs = this.vocabs.data(this.model.vocabs, function(d) {return d;});
    var vocabPees = this.vocabs.enter().append("tr").classed(".vocabBox",true);
    vocabPees.append("td").append("input")
    	.attr("type", "checkbox")
    	.on("mouseup", function(d) {
    			//view.layout.stop();
    			//view.layoutRunning = false;
    			puroControl.vocabChange(d, !d3.select(this).node().checked);
    		});
    vocabPees.append("td").text(function(d) {return d;});
    
    
	this.vocabs.selectAll("input").property("checked", function(d) {
		if(puroControl.selectedNode!=null) return puroControl.selectedNode.hasVocab(d)?true:false;
		else return (puroControl.selectedVocabs.indexOf(d)>=0)?true:false;
		return false;});
    
    this.vocabs.exit().remove();
    
    var vocabHeading = purostr.compareVocabs;
    if(puroControl.selectedNode != null) vocabHeading = purostr.isInVocabs;
    d3.select("#vocabListHeading").text(vocabHeading);
}

PuroView.prototype.drawVocabPaths = function() {
	function configLodsightFrameShowing(mark, namespace) {
		mark.on("mouseover", function(){
			$.getJSON("http://localhost/lodsight-iframe/lodsight-graph-creator/get-visualization-url.php?uri="+namespace, null, function(response) {
				d3.select('#lodsightFrame').attr('src', response.url+"&controls=false")
					.style("display", "block");
			});
		})
		.on("click", function(){
			$.getJSON("http://localhost/lodsight-iframe/lodsight-graph-creator/get-visualization-url.php?uri="+namespace, null, function(response) {
				window.open(response.url, '_blank');
			});
		});
	}
	
	
	this.svg.selectAll(".vocabPath").remove();
	//var colors = ["#f00","#0c0","#00d","#ff0","#0ff"];
	//if(! this.layoutRunning) {
		var textPositions = [];
		
		for(var i=0;i<this.model.vocabs.length; i++) {
			if(this.puroCtrl.selectedVocabs.indexOf(this.model.vocabs[i])>=0)
			{
				paths = this.puroCtrl.createVocabPaths(this.model.vocabs[i]);
				for(j=0;j<paths.length; j++){
					var labelPos = this.findBestLabelPos(textPositions, paths[j]);
					textPositions.push(labelPos);
					this.svg.append("path").classed("vocabPath", true).attr('filter', "url(#blur-filter)")
						.attr("d", vocabPath(paths[j])).attr("stroke", this.colors(i)).attr("fill", "none").attr("stroke-width",vocabPathWidth);
					var mark = this.svg.append("g").classed("vocabPath", true);
					var namespace = this.model.vocabs[i];
					
					configLodsightFrameShowing(mark, namespace);
					
					var text = this.svg.append("text").classed("vocabPath", true).attr("x",labelPos.x).attr("y",labelPos.y).attr("fill", this.colors(i));
					text.text(this.model.vocabs[i]);
					var bbox = text.node().getBBox();
					var padding = 3;
					mark.append("rect")
					    .attr("x", bbox.x - padding)
					    .attr("y", bbox.y - padding)
					    .attr("width", bbox.width + (padding*2))
					    .attr("height", bbox.height + (padding))
					    .style("fill", "#eee");
				}
			}
	}
	//}
};

PuroView.prototype.findBestLabelPos = function(otherPositions, path){
	if(otherPositions.length == 0) return new Point(path[0].x, path[0].y);
	else{
		maxDistance = 0;
		maxDistI = 0;
		for(var posI = 0; posI < path.length; posI++) {
			nearestOtherPosI = 0;
			minDistance = Number.MAX_VALUE;
			for(otherPosI = 0; otherPosI<otherPositions.length; otherPosI++){
				if(pointDistance(otherPositions[otherPosI], path[posI])<minDistance){
					nearestOtherPosI = otherPosI;
					minDistance = pointDistance(otherPositions[otherPosI], path[posI]);
				}
			}
			if(minDistance>maxDistance){
				maxDistance = minDistance;
				maxDistI = posI;
			}
		}
		return path[maxDistI];	
	}
};

PuroView.prototype.createToolbox = function(toolElement, puroControl) {
	this.toolSvg = d3.select("#"+toolElement).append("svg")
		.attr("width", 300)
		.attr("height", 500);
	
	addButton = function(label, width, height, x, y, pathFunction, onClickFunction, specialColor) {
		var gButton = PuroEditor.view.toolSvg.append("g").classed("node",true);
		
		var button = gButton.append("path").attr("d", pathFunction.apply(null, [width,height]));
				if(specialColor != null) button.style("fill", specialColor);
		gButton.append("text").text(label)
			.attr("text-anchor", "middle")
			.attr("x", "0") //width/2+5)
			.attr("y","0")
		     .attr("dx", 1)
		     .attr("dy", ".35em")
	  		.style("font-size", function(d) { 
	  			return Math.min(width, (width - 8) 
	  			/ this.getComputedTextLength() * 12) + "px"; });   
		gButton.attr('transform', function(d) {
	    		return 'translate( '+x+', '+y+')';
	  		});        	
	  	gButton.on("mousedown", function(){
	  		PuroEditor.view.toolSvg.selectAll("g").classed("selected", false); 
	  		//d3.select(this).classed("selected", true);
	  		onClickFunction.call(null);
	  		});
	  	return gButton;
	};	
	
	this.buttons = {};
	this.buttonsArray = [];
	
	//addButton("Move/Rename", 150, 50, 210, 350, BTypePath, function(){
	//		puroControl.setTool(puroControl.TOOL.select);}, "#7dd");
	this.buttons.link = addButton("<- Link ->", 110, 20, 210, 110, BTypePath, function(){
			puroControl.setTool(puroControl.TOOL.link);});
	this.buttons.link.tool = puroControl.TOOL.link;
	this.buttons.instanceOf = addButton("<- instanceOf-Link ->", 170, 30, 210, 50, BTypePath, function(){
			puroControl.setTool(puroControl.TOOL.instanceOfLink);});
	this.buttons.instanceOf.tool = puroControl.TOOL.instanceOfLink;
	this.buttons.subTypeOf = addButton("<- subTypeOf-Link ->", 170, 30, 210, 170, BTypePath, function(){
			puroControl.setTool(puroControl.TOOL.subtypeOfLink);});
	this.buttons.subTypeOf.tool = puroControl.TOOL.subtypeOfLink;
	addButton("BType", 100, 50, 70, 30, BTypePath, function(){
			puroControl.setTool(puroControl.TOOL.createBType);});
	addButton("BObject", 100, 30, 70, 110, BObjectPath, function(){
			puroControl.setTool(puroControl.TOOL.createBObject);});
	addButton("BRelation", 120, 80, 70, 205, BRelationPath, function(){
			puroControl.setTool(puroControl.TOOL.createBRelation);});
	addButton("BValuation", 120, 30, 70, 290, BValuationPath, function(){
			puroControl.setTool(puroControl.TOOL.createBValuation);});
	this.buttons.del = addButton("Delete", 80, 30, 80, 400, BValuationPath, function(){
			puroControl.setTool(puroControl.TOOL.del);}, "#f77");
	this.buttons.del.tool = puroControl.TOOL.del;
	this.buttonsArray.push(this.buttons.link);
	this.buttonsArray.push(this.buttons.instanceOf);
	this.buttonsArray.push(this.buttons.subTypeOf);
	this.buttonsArray.push(this.buttons.del);
};

function BTypePath(width, height) {
	return "M"+(0)+","+(-height/2)+" a"+width/2+" "+height/2+" 0 1 0 1,0 z";	
}

function BObjectPath(width, height) {
	return "M"+(-width/2)+","+(-height/2)+" l 0,"+height+" l "+width+",0 l 0,"+(-height)+" z";
}

function BRelationPath(width, height) {
	return "M"+(-width/2)+","+(0)+" l "+width/2+","+height/2+" l "+width/2+","+(-height/2)+" l "+(-width/2)+","+(-height/2)+" z";
}

function BValuationPath(width, height) {
	var slope = width/7;
	return "M"+((-width/2))+","+(height/2)+" l "+(width)+","+0+" l "+slope+","+(-height)+" l "+(-width)+","+(0)+" z";
}

function vocabPath(fromPath) {
	if(fromPath.length<2) return "";
	path = "M"+fromPath[0].x+","+fromPath[0].y+" L"+fromPath[1].x+","+fromPath[1].y;
	for(i = 2; i<fromPath.length; i++) {
		path+= " "+fromPath[i].x+","+fromPath[i].y;
	}
	path += "Z";
	return path;
}

BType.prototype.getPathData = function() {
	this.width=90;
	this.height=40;
	return BTypePath(this.width, this.height);
};

BObject.prototype.getPathData = function() {
	this.width=90;
	this.height=40;
	return BObjectPath(this.width, this.height);
};

BRelation.prototype.getPathData = function() {
	this.width=110;
	this.height=60;
	return BRelationPath(this.width, this.height);
};

BValuation.prototype.getPathData = function() {
	this.width=90;
	this.height=40;
	this.slope = this.width/7;
	return BValuationPath(this.width, this.height);
};

BLink.prototype.dashed = function() {
	return "5,5";
};

InstanceOfLink.prototype.dashed = function() {
	return "";
};

SubTypeOfLink.prototype.dashed = function() {
	return "3,3";
};