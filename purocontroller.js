

function PuroController(model){
	this.TOOL = Object.freeze({select: {}, createBType: {}, createBValuation: {}, createBObject: {}, createBRelation: {}, link: {}, instanceOfLink: {}, subtypeOfLink: {}, del: {}});
	this.model = model;
	this.activeTool = this.TOOL.select;
	this.linkStart = null;
	this.selectedNode = null;
	this.store = new PuroLoader();
	this.selectedVocabs = [];
}

PuroController.prototype.startNodeDrag = function(node) {
	
	this.view.setDraggedNode(node);

    
}

PuroController.prototype.setTool = function(tool){
	this.linkStart = null;
	this.activeTool = tool;
	this.selectNode(null);
	switch(this.activeTool){
		case this.TOOL.createBType:
			this.startNodeDrag(new BType("new BType"));
			d3.select("#tooltip").text("Click on the canvas (on the right) to add a new B-Type.");
			break;
		case this.TOOL.createBValuation:
			this.startNodeDrag(new BValuation("new BValuation"));
			d3.select("#tooltip").text("Click on the canvas (on the right) to add a new B-Valuation.");
			break;
		case this.TOOL.createBObject:
			this.startNodeDrag(new BObject("new BObject"));
			d3.select("#tooltip").text("Click on the canvas (on the right) to add a new B-Object.");
			break;
		case this.TOOL.createBRelation:
			this.startNodeDrag(new BRelation("new BRelation"));
			d3.select("#tooltip").text("Click on the canvas (on the right) to add a new B-Relation.");
			break;
		case this.TOOL.link:
			d3.select("#tooltip").text("Click on the node to start a link from there.");
			break;
		case this.TOOL.instanceOfLink:
			d3.select("#tooltip").text("Click on the node that is the instance to start a link from there.");
			break;
		case this.TOOL.subtypeOfLink:
			d3.select("#tooltip").text("Click on the node that is the subtype to start a link from there.");
			break;
		case this.TOOL.select:
			d3.select("#tooltip").text("Double-click on a node or a link to rename it. You can also drag-drop nodes.");
			break;
		case this.TOOL.del:
			d3.select("#tooltip").text("Click on a node or a link to delete it.");
			break;
		
	}
	this.view.updateView();
};

PuroController.prototype.setView = function(view){
	this.view = view;
};

PuroController.prototype.newNode = function(node, location){
	this.setTool(this.TOOL.select);
	node.x = location[0];
	node.y = location[1];
	this.model.addNode(node);
	this.model.validate();
	this.view.updateView();
};

PuroController.prototype.canvasMouseDown = function(location, node){
	if(this.activeTool === this.TOOL.createBType) {
		this.newNode(new BType("new BType"), location);
	}
	else if(this.activeTool === this.TOOL.createBValuation) {
		this.newNode(new BValuation("new BValuation"), location);
	}
	else if(this.activeTool === this.TOOL.createBObject) {
		this.newNode(new BObject("new BObject"), location);
	}
	else if(this.activeTool === this.TOOL.createBRelation) {
		this.newNode(new BRelation("new BRelation"), location);
	}
	else if(this.activeTool === this.TOOL.link
		|| this.activeTool === this.TOOL.instanceOfLink
		|| this.activeTool === this.TOOL.subtypeOfLink) {
		if(node!=null && node != this.linkStart){
			if(this.linkStart != null  && node!=null) {
				this.selectNode(null);
				if(this.activeTool == this.TOOL.link) {
					var link = new RelationLink("",this.linkStart, node);
					if(link.start != null) {
						this.model.addLink(link);
						this.saveModel();
					}
					else {
						alert("Can't create link between these entities in this direction.");
					}
				}
				if(this.activeTool == this.TOOL.instanceOfLink) {
					var link = new InstanceOfLink("new link",this.linkStart, node);
					if(link.start!=null) 
						{
							this.model.addLink(link);
							this.saveModel();
						}
					else {
						alert("Can't create instanceOf link between these entities.");
					}
				}
				if(this.activeTool == this.TOOL.subtypeOfLink) {
					var link = new SubTypeOfLink("new link",this.linkStart, node);
					if(link.start!=null) 
						{
							this.model.addLink(link);
							this.saveModel();
						}
					else {
						alert("Can't create subTypeOf link between these entities.");
					}
				}
				this.linkStart = null;
				d3.select("#tooltip").text("");
				this.model.validate();
				this.view.updateView();
			}
			else {
				d3.select("#tooltip").text("Now click on the node that is the target of the relationship link.");
				this.linkStart = node; 
				this.selectNode(node);
				this.view.updateView();
			}
		}
	}
	else if(this.activeTool === this.TOOL.del) {
		this.selectNode(null);
		if(node!=null && node instanceof BTerm) 
		{
			this.model.removeNode(node);
			this.model.validate();
			this.view.updateView();
		}
		if(node!=null && node instanceof BLink) 
		{
			this.model.removeLink(node);
			this.model.validate();
			this.view.updateView();
		}
	}
	else if(this.activeTool === this.TOOL.select) {
		//if(node!=null && this.model.nodes.indexOf(node)>=0) {
			this.selectNode(node, d3.event.shiftKey);
			this.view.updateView();
		//}
	}
};

PuroController.prototype.selectNode = function(node, noDeselectFirst) {
	if(!noDeselectFirst || node == null) {
		for(var i=0; i<this.model.nodes.length; i++){
			this.model.nodes[i].selected = false;
		}
	}
	if(node!=null) {
		node.selected = true;
		this.selectedNode = node;
	}
	else {
		this.selectedNode = null;
	}
	this.updateDisplayedModelingSelection();
};

PuroController.prototype.modelingStyleChanged = function(modelingStyle, checked) {
	if(checked == true && this.selectedNode != null) this.selectedNode.modelingStyle = modelingStyle;
};

PuroController.prototype.mappingChanged = function(mapping, checked) {
	if(this.selectedNode!=null) {
		for(var i=0; i<this.selectedNode.mappings.length; i++) this.selectedNode.mappings[i].selected = false;
	}
	if(checked == true && this.selectedNode != null) {
		mapping.selected = true;
		//d3.select("#vowlFrame").property("src", vowlUrl+mapping.namespace);
		this.model.addMappingNode(this.selectedNode, mapping);
		this.view.updateView();
	}	
};

PuroController.prototype.temporalityChanged = function(checked) {
	if(this.selectedNode != null) this.selectedNode.perdurant = checked;
};

PuroController.prototype.updateDisplayedModelingSelection = function() {
	for(var i=0; i<ModelingStyles.length; i++) {
		if(this.selectedNode!=null && ModelingStyles[i].id == this.selectedNode.modelingStyle.id) ModelingStyles[i].selected = true;
		else ModelingStyles[i].selected = false;
	}
};

PuroController.prototype.nodeDblClick = function(node) {
		do {
		var unique = false;
		var result = prompt('Change the name of the entity',node.name);
		var validRename = false;
		if(result)
			{
				unique = !this.model.labelExists(result);
			    if(node.isValidLabel(result, unique)) {
			      node.name = result;
			      this.model.validate();
			      this.view.updateView();
			      validRename = true;}
			    else alert('The name must be unique.');
			}
		} while(result && !validRename);
};

PuroController.prototype.loadModel = function(id) {
	 this.store.getOBMbyId(id, this);
};

PuroController.prototype.showAllVocabs = function() {
		d3.select("#vocabs").selectAll("input").property("checked", true);
		for(var i=0; i<this.model.vocabs.length; i++){
			this.selectedVocabs.push(this.model.vocabs[i]);
		}
		this.view.updateView();
};

PuroController.prototype.loadModelFromJStore = function(obm) {
	this.model.empty();
	this.view.updateView();
	this.model = obm;
	 this.view.setData(this.model);
	 this.view.updateView();
	 this.showAllVocabs();
	 
	 //DEBUG
	 this.getMappings();
};

PuroController.prototype.promptForModelName = function() {
	return prompt('Enter the name of the model',"");
};

PuroController.prototype.newModel = function() {
	result = this.promptForModelName();
			    if(result) {
			      this.model = new PuroModel();
			      this.model.name = result;
			      //this.model.id = this.store.getNewId();
			      this.view.setData(this.model);
			      this.view.updateView();}
};

PuroController.prototype.saveModel = function() {
	//var store = null;
	/*require(["dojo/ready", "dojox/data/CouchDBRestStore"], function(CouchDb){
	  	 store = new CouchDb({target: "http://admin:c0d1988@192.168.1.2:5984/puromodels"});
			   
	  });*/
	  
	  //dojo.require("dojox.data.CouchDBRestStore");
	  //store = new dojox.data.CouchDBRestStore({target: couchdbUrl}); //"http://admin:c0d1988@protegeserver.cz/couchdb"});
  		
  		//store.put(this.model,null);
  	if(this.model.name == "") this.model.name = this.promptForModelName();
  	this.model.author = this.getCurrentUser();
 	this.store.saveModel(this.model);
 	//newItem(this.model,null);
 	//this.store.save(null);
 	
 	
 	//myStores = dojox.data.CouchDBRestStore.getStores("http://admin:c0d1988@192.168.1.2:5984/_utils/");
  
};

PuroController.prototype.saveModelAs = function() {
	this.model.name = this.promptForModelName();
	this.model.oldId = null;
  	this.model.author = this.getCurrentUser();
	this.store.saveModel(this.model);
};

PuroController.prototype.transformModel = function() {
	PuroRdfSerializer.transformToVariants(this.model);
}

PuroController.prototype.newVocab = function() {
	var result = prompt('Enter the URI of the vocabulary or ontology',"");
			    if(result) {
			      this.model.addVocab(result);
			      this.view.updateView();}
};

PuroController.prototype.delVocab = function() {
	//inputs = d3.select("#"+vocabsDiv).selectAll("input[checked=checked]");
	for(var i=0; i<this.selectedVocabs.length; i++){
		this.model.delVocab(this.selectedVocabs[i]);
	}
	this.selectedVocabs = [];
	this.view.updateView();
	this.view.drawVocabPaths();
};

PuroController.prototype.vocabChange = function(vocab, checked) {
	if(this.selectedNode!=null) {
		if(checked==true){
			for(var i=0; i<this.model.nodes.length; i++)
			if(this.model.nodes[i].selected) this.model.nodes[i].addVocab(vocab);
		}
		else {
			for(var i=0; i<this.model.nodes.length; i++)
			if(this.model.nodes[i].selected) this.model.nodes[i].delVocab(vocab);
		}
	}
	else {
		if(checked==true) {
			this.selectedVocabs.push(vocab);
		}
		else {
			vocabIndex = this.selectedVocabs.indexOf(vocab);
			if(vocabIndex >= 0 && vocabIndex < this.selectedVocabs.length) this.selectedVocabs.splice(vocabIndex,1);
		}
	}
	this.view.drawVocabPaths();
};

PuroController.prototype.updateOFM = function() {
	function processTransformResponse(data) {
		dojo.require("dojox.json.ref");
		ofmUrls = dojox.json.ref.fromJson(data);
		if(ofmUrls != null && ofmUrls.length>0) {
			d3.select("#vowlFrame").property("src", ofmUrls[0].vowlUrl);
			d3.select("#ofmDownloadLink").property("href", ofmUrls[0].downloadUrl);
			d3.select("#ofmVisualLink").property("href", ofmUrls[0].vowlUrl);
		}
	};
	PuroRdfSerializer.getOFMVisualizationUrl(this.model, processTransformResponse);
};

PuroController.prototype.showMappingInfo = function(mapping) {
	if(mapping.name!="none") {
		d3.select("#mappingInfoWindow").style("visibility", "visible");
		d3.select("#mappingInfoFrame").property("src", mapping.uri);
	}
}

PuroController.prototype.hideMappingInfo = function() {
	d3.select("#mappingInfoWindow").style("visibility", "hidden");	
}

PuroController.prototype.extractMappings = function(data) {
	dojo.require("dojox.json.ref");
	var mappings = null;
	if(typeof data == "string" )  mappings = dojox.json.ref.fromJson(data);
	else if(typeof data == "object") mappings = data;
	if(mappings != null) {
		this.mappings = mappings.mappings;
		this.namespaces = mappings.namespaces;
		this.storeMappings();
		this.storeVocabs();
	}
	this.hideSpinner();
	this.view.updateView();
}

PuroController.prototype.storeMappings = function() {
	for(var i=0; i<this.model.nodes.length; i++) {
		this.model.nodes[i].initMappings();
		for(var j=0; j<this.mappings.length; j++) {
			if(this.model.nodes[i].getURI() == this.mappings[j].from) {
				var mapping = Object.create(Mapping);
				mapping.init(this.mappings[j]);
				this.model.addMapping(this.model.nodes[i], mapping);			
			}
		}
	}
}

PuroController.prototype.storeVocabs = function() {
	for(var i=0; i<this.namespaces.length; i++) {
		this.model.addVocab(this.namespaces[i].str);
		this.selectedVocabs.push(this.namespaces[i].str);
	}
}

PuroController.prototype.showSpinner = function() {
	this.spinner = new Spinner().spin(document.getElementById('mappingProgressDiv'));
	d3.select("#mappingProgressDiv").style("visibility", "visible");
}

PuroController.prototype.hideSpinner = function() {
	this.spinner.stop();
	d3.select("#mappingProgressDiv").style("visibility", "hidden");
}

PuroController.prototype.getMappings = function() {
	this.showSpinner();
	if(PuroAppSettings.loadDebugJson) $.get('../debug/mappingExample.json', this.extractMappings.bind(this));
	else PuroRdfSerializer.getMappings(this.model, this.extractMappings.bind(this));
}

PuroController.prototype.getTransformation = function() {
	function processTransformResponse(data) {
		dojo.require("dojox.json.ref");
		ofmUrls = dojox.json.ref.fromJson(data);
		if(ofmUrls != null && ofmUrls.length>0) {
			d3.select("#vowlFrame").property("src", ofmUrls[0].vowlUrl);
			d3.select("#ofmDownloadLink").property("href", ofmUrls[0].downloadUrl);
			d3.select("#ofmVisualLink").property("href", ofmUrls[0].vowlUrl);
		}
	};
	PuroRdfSerializer.getOFMVisualizationUrl(this.model, processTransformResponse);
};

PuroController.prototype.getCurrentUser = function () {
	if(document.getElementById("user")) this.currentUser = document.getElementById("user").value;
	return this.currentUser;
};

PuroController.prototype.getOBMs = function() {
	//return this.store.getOBMs(this.view);	
	var control = this;
	var user = this.getCurrentUser();
	var pass = document.getElementById("pass").value;
	$.get(couchLoginUrl+"?user="+user+"&pass="+pass, function(data) {
		dojo.require("dojox.json.ref");
		var response = dojox.json.ref.fromJson(data);
		if(response.result) {
			control.store.getOBMs(control.view, response.couchurl, user);
			d3.select("#divLogin").html("Logged in as "+user);
		}
		else {
			d3.select("#divLoginMessage").html("Login failed.")
		}
	})
};

PuroController.prototype.createVocabPaths = function(vocab) {
	
	var rStep = 3;
	var radius = vocabHighlightRadius + this.model.vocabs.indexOf(vocab)*rStep;
	var coef = 5;
	
	toMatrix = function(coord) {return Math.round(coord/coef+radius);};
	ptFromMatrix = function(point) {return new Point((point.x-radius)*coef, (point.y-radius)*coef);};
	
	ptToMatrix = function(point) {
		matrixPt = {};
		matrixPt.x = toMatrix(point.x);
		matrixPt.y = toMatrix(point.y);
		return matrixPt;
	};
	
	
	//var matrix = [];
	var mWidth = toMatrix(this.view.width)+radius*2;
	var mHeight = toMatrix(this.view.height)+radius*2;
	
	var M = {};
	M.matrix = [];
	
	for(var i=0; i<mWidth+1; i++) {
		M.matrix[i] = [];
		for(var j=0; j<mHeight+1; j++) {
			M.matrix[i][j]=0;
		}
	}
	
	M.get = function(_x,_y){
		var x=Math.round(_x);
		var y=Math.round(_y);
		if(x>=0 && x<M.matrix.length){
			if(y>=0 && y<M.matrix[x].length) return M.matrix[x][y];
		}
		return -1;
	};
	
	M.set = function(_x,_y,val){
		var x=Math.round(_x);
		var y=Math.round(_y);
		if(x>=0 && x<M.matrix.length){
			if(!(typeof M.matrix[x] === "undefined")) {
				if(y>=0 && y<M.matrix[x].length) M.matrix[x][y]=val;
			}
			else(alert('undefined M.matrix[x] ...x='+x));
		}		
	};
	
	
	
	fillCircle = function(realPoint) {
		var center = ptToMatrix(realPoint);
		var p = new Point(0,0);
		for(p.x=center.x-radius; p.x<=center.x+radius; p.x++){
			for(p.y=center.y; pointDistance(p,center)<radius; p.y++){
				M.set(p.x,p.y,1);//matrix[p.x][p.y]=1;
			}			
			for(p.y=center.y; pointDistance(p,center)<radius; p.y--){
				M.set(p.x,p.y,1);//matrix[p.x][p.y]=1;
			}
		}
	};
	
	normalize = function(pt) {
		var length = Math.sqrt( Math.pow(pt.x,2)+ Math.pow(pt.y,2) );
		pt.x = pt.x / length;
		pt.y = pt.y / length;
		return pt;
	};
	
	normal = function(point) {
		var pt = new Point(-point.y, point.x);
		return normalize(pt);
	};
	
	
	fillPath = function(realStart, realEnd) {
		var start = ptToMatrix(realStart);
		var end = ptToMatrix(realEnd);
		var lineV = new Point(end.x-start.x, end.y - start.y);
		var lineN = normal(lineV);		
		normalize(lineV);
		var length = pointDistance(start, end);
		var p = new Point(start.x, start.y); 
		while(pointDistance(p, start)<=length){
			var pL = new Point(p.x, p.y);
			while(pointDistance(pL,p)<=radius){
				M.set(pL.x,pL.y,1); //matrix[pL.x][pL.y]=1;
				pL.x+=lineN.x; pL.y+=lineN.y;
			}
			var pR = new Point(p.x, p.y);
			while(pointDistance(pR,p)<=radius){
				M.set(pR.x,pR.y,1); //matrix[pR.x][pR.y]=1;
				pR.x-=lineN.x; pR.y-=lineN.y;
			}			
			p.x+=lineV.x; p.y+=lineV.y;
		}
	};	
	
	for(i=0; i<this.model.nodes.length; i++){
		if(this.model.nodes[i].hasVocab(vocab)) fillCircle(new Point(this.model.nodes[i].x,this.model.nodes[i].y));
	}
	
	for(i=0; i<this.model.links.length; i++){
		if(this.model.links[i].start.hasVocab(vocab) && this.model.links[i].end.hasVocab(vocab)) 
		fillPath(new Point(this.model.links[i].start.x,this.model.links[i].start.y),
				new Point(this.model.links[i].end.x,this.model.links[i].end.y));
	}
	
	fillFromPoint = function(_x,_y){
		var ptStack = [];
		ptStack.push(new Point(_x,_y));
		while(ptStack.length>0) {
			var pt = ptStack.pop();
			var x = pt.x; var y = pt.y;
			if(M.get(x,y)==1 || 
					(M.get(x,y)==0 && M.get(x-1,y)!=0 && M.get(x+1,y)!=0) || 
					(M.get(x,y)==0 && M.get(x,y-1)!=0  && M.get(x,y+1)!=0))	{ //matrix[x][y]==1
				M.set(x,y,2); //matrix[x][y]=2;
				/*fillFromPoint(x-1,y);
				fillFromPoint(x,y-1);
				fillFromPoint(x+1,y);
				fillFromPoint(x,y+1);*/
				ptStack.push(new Point(x-1,y));
				ptStack.push(new Point(x,y-1));
				ptStack.push(new Point(x+1,y));
				ptStack.push(new Point(x,y+1));
			}
		} 		
	};
	
	isBorderPoint = function(x,y){
		if(M.get(x,y)!=2) return false; //matrix[x][y]!=2
		//zeroNeighbor = false;
		if(M.get(x-1,y)==0) return true; //matrix[x-1][y]
		if(M.get(x-1,y-1)==0) return true; //matrix[x-1][y-1]
		if(M.get(x,y-1)==0) return true; //matrix[x][y-1]
		if(M.get(x+1,y-1)==0) return true; //matrix[x+1][y-1]
		if(M.get(x+1,y)==0) return true; //matrix[x+1][y]
		if(M.get(x+1,y+1)==0) return true; //matrix[x+1][y+1]
		if(M.get(x,y+1)==0) return true; //matrix[x][y+1]
		if(M.get(x-1,y+1)==0) return true; //matrix[x-1][y+1]
		return false;
	};
	
	
	constructPath = function(path, x,y){
		if(isBorderPoint(x,y)){
			M.set(x,y,3);//matrix[x][y]=3;
			path.push(ptFromMatrix(new Point(x,y)));
			/*
			if(!constructPath(path, x-1, y)) {
				if(!constructPath(path, x-1, y-1)) {
					if(!constructPath(path, x, y-1)) {
						if(!constructPath(path, x+1, y-1)) {
							if(!constructPath(path, x+1, y)) {
								if(!constructPath(path, x+1, y+1)) {
									if(!constructPath(path, x, y+1)) {
										if(!constructPath(path, x-1, y+1)) return true;
									}
								}
							}
						}
					}
				}
			}
			return true;*/
			if(constructPath(path, x-1, y)) return true;
			if(constructPath(path, x, y-1)) return true;
			if(constructPath(path, x+1, y)) return true;
			if(constructPath(path, x, y+1)) return true;
			
			
			if(constructPath(path, x-1, y-1)) return true;
			if(constructPath(path, x+1, y-1)) return true;
			if(constructPath(path, x+1, y+1)) return true;
			if(constructPath(path, x-1, y+1)) return true;
			
			return true;
		}
		else return false;
	};
	
	var paths = [];
	var mini = 0;
	var minj = 0;
	for(var i=0; i<mWidth+1; i++) {
		for(var j=0; j<mHeight+1; j++) {
			if(M.get(i,j)==1) { //matrix[i][j]==1
				mini = i;
				minj = j;
				fillFromPoint(i,j);
				var path = [];
				constructPath(path, i, j);
				paths.push(path);
			} 
		}
	}
	
	/*d3.select("#debugtable").selectAll("tr").remove;
	var debugTab = d3.select("#debugtable");
	for(var i=0; i<M.matrix.length; i++){
		var tr = debugTab.append("tr");
		for(var j=0; j<M.matrix[i].length; j++) {
			tr.append("td").text(M.get(i,j));
		}
	}*/
	
	return paths;
};

//ellipse a,b,x0,y0; line y=cx+d
function ellipseLineIntersection(a,b,x0,y0,c,d) {
	var eq = new Object();
	eq.a = b*b + a*a*c*c;
	eq.b = 2*a*a*c*d - 2*a*a*c*y0 - 2*b*b*x0;
	eq.c = b*b*x0*x0+a*a*y0*y0+d*d*a*a-a*a*b*b-2*a*a*d*y0;
	var D = eq.b*eq.b - 4*eq.a*eq.c;
	if(D<0) return null;
	else {
		var intersections = [];
		intersections[0] = new Object();
		intersections[1] = new Object();
		intersections[0].x = (-eq.b + Math.sqrt(D))/(2*eq.a);
		intersections[1].x = (-eq.b - Math.sqrt(D))/(2*eq.a);
		intersections[0].y = c*intersections[0].x+d;
		intersections[1].y = c*intersections[1].x+d;
		return intersections;
	}
}

function nearPoint(from, points) {
	if(points == null) return null;
	var minDist = Number.MAX_VALUE;
	var minIndex = 0;
	for(var i = 0, l = points.length; i<l; i++) {
		var dist = pointDistance(from, points[i]);
		if(dist<minDist) {
			minDist = dist;
			minIndex = i;
		}
	}
	return points[minIndex];
}

function pointDistance(a,b) {
	return Math.sqrt( Math.pow(b.x-a.x,2)+ Math.pow(b.y-a.y,2) );
}

//line y=cx+d
function lineEquation(start, end) {
	if((end.x-start.x)==0) return null;
	var lineEq = {};
	lineEq.c = (end.y-start.y)/(end.x-start.x);
	lineEq.d = (start.y - lineEq.c*start.x);
	return lineEq;
}

//ellipse a,b,x,y
function nearEllipseIntersection(ellipse,line, nearTo) {
	lineEq = lineEquation(line.start, line.end);
	return nearPoint(nearTo, ellipseLineIntersection(ellipse.a, ellipse.b, ellipse.x, ellipse.y, lineEq.c, lineEq.d));
}

BType.prototype.linkIntersection = function(link, nearTo){
	var ellipse = {};
	ellipse.a = this.width/2;
	ellipse.b = this.height/2;
	ellipse.x = this.x;
	ellipse.y = this.y;
	return nearEllipseIntersection(ellipse, link, nearTo);
};

MappingNode.linkIntersection = function(link, nearTo){
	var ellipse = {};
	ellipse.a = this.width/2;
	ellipse.b = this.height/2;
	ellipse.x = this.x;
	ellipse.y = this.y;
	return nearEllipseIntersection(ellipse, link, nearTo);
};

//rayEq: y=cx+d
function rayLineIntersection(rayStart, rayEq, lineStart, lineEnd) {
	lineEq = lineEquation(lineStart, lineEnd);
	var point = {};
	lineVec = {};
	if(lineEq!=null){
		if(rayEq==null){
			point.x = rayStart.x;
			point.y = lineEq.c*rayStart.x+lineEq.d;
		}
		if((lineEq.c - rayEq.d)==0) return null;
		point.x = (rayEq.d - lineEq.d) / (lineEq.c - rayEq.c);
		point.y = rayEq.c*point.x+rayEq.d;
	}
	else{
		if(rayEq==null) return null;
		point.x = lineStart.x;
		point.y = rayEq.c*point.x+rayEq.d;
	}
	lineVec.x = lineEnd.x - lineStart.x;
	lineVec.y = lineEnd.y - lineStart.y;
	var k = -1;
	if(lineVec.x!=0) k = (point.x - lineStart.x) / lineVec.x;
	else if(lineVec.y!=0) k = (point.y - lineStart.y) / lineVec.y;
	if(k<0 || k>1) return null;
	return point;
}

function Point(x,y) {
	this.x = x;
	this.y = y;
}

function Line(start, end) {
	this.start = start;
	this.end = end;
}

BObject.prototype.linkIntersection = function(link, nearTo){
	var lines = [
		new Line(new Point(this.x-this.width/2, this.y-this.height/2), new Point(this.x+this.width/2, this.y-this.height/2)),
		new Line(new Point(this.x-this.width/2, this.y-this.height/2), new Point(this.x-this.width/2, this.y+this.height/2)),
		new Line(new Point(this.x+this.width/2, this.y-this.height/2), new Point(this.x+this.width/2, this.y+this.height/2)),
		new Line(new Point(this.x-this.width/2, this.y+this.height/2), new Point(this.x+this.width/2, this.y+this.height/2)),		
	];
	var intersections = [];
	for(var i=0; i<4; i++) {
		var inters = rayLineIntersection(link.start, lineEquation(link.start,link.end), lines[i].start, lines[i].end);
		if(inters!=null) intersections.push(inters);
	}
	if(intersections.length==0) 
	{
		return null;
	}
	return nearPoint(nearTo, intersections);
};

BRelation.prototype.linkIntersection = function(link, nearTo){
	var lines = [
		new Line(new Point(this.x-this.width/2, this.y), new Point(this.x, this.y-this.height/2)),
		new Line(new Point(this.x-this.width/2, this.y), new Point(this.x, this.y+this.height/2)),
		new Line(new Point(this.x+this.width/2, this.y), new Point(this.x, this.y-this.height/2)),
		new Line(new Point(this.x+this.width/2, this.y), new Point(this.x, this.y+this.height/2)),		
	];
	var intersections = [];
	for(var i=0; i<4; i++) {
		var inters = rayLineIntersection(link.start, lineEquation(link.start,link.end), lines[i].start, lines[i].end);
		if(inters!=null) intersections.push(inters);
	}
	if(intersections.length==0) return null;
	return nearPoint(nearTo, intersections);
};

BValuation.prototype.linkIntersection = function(link, nearTo){
	var lines = [
		new Line(new Point(this.x-this.width/2, this.y+this.height/2), new Point(this.x+this.width/2, this.y+this.height/2)),
		new Line(new Point(this.x+this.width/2, this.y+this.height/2), new Point(this.x+this.width/2+this.slope, this.y-this.height/2)),
		new Line(new Point(this.x+this.width/2+this.slope, this.y-this.height/2), new Point(this.x-this.width/2+this.slope, this.y-this.height/2)),
		new Line(new Point(this.x-this.width/2+this.slope, this.y-this.height/2), new Point(this.x-this.width/2, this.y+this.height/2)),		
	];
	var intersections = [];
	for(var i=0; i<4; i++) {
		var inters = rayLineIntersection(link.start, lineEquation(link.start,link.end), lines[i].start, lines[i].end);
		if(inters!=null) intersections.push(inters);
	}
	if(intersections.length==0) return null;
	return nearPoint(nearTo, intersections);
};

BLink.prototype.countEndFromIntersection = function() {
	var intersection = this.end.linkIntersection(this, this.start);
	this.endX = intersection.x;
	this.endY = intersection.y;
};

BLink.prototype.countStartFromIntersection = function() {
	var intersection = this.start.linkIntersection(this, this.end);
	this.startX = intersection.x;
	this.startY = intersection.y;
};

BLink.prototype.getMiddlePoint = function() {
	lineVec = new Point();
	lineVec.x = this.end.x - this.start.x;
	lineVec.y = this.end.y - this.start.y;
	middle = new Point();
	middle.x = this.start.x + 0.5*lineVec.x;
	middle.y = this.start.y + 0.5*lineVec.y;
	return middle;
};



