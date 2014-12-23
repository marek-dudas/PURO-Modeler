function BTerm(name) {
	this.selected = false;
	this.name = name;
	this.id = -1;
	this.inVocabs = [];
} 

function BType(name) {
	BTerm.call(this,name);
	this.type=purostr.Btype; //"B-type";
	this.level=1;
}

function BObject(name) {
	BTerm.call(this,name);
	this.type=purostr.Bobject; //"B-object";
}

function BValuation(name) {
	BTerm.call(this,name);
	this.type=purostr.Bvaluation; //"B-valuation";
}

function BRelation(name) {
	BTerm.call(this,name);
	this.type=purostr.Brelation; //"B-relation";
}

BType.prototype = Object.create(BTerm.prototype);
BObject.prototype = Object.create(BTerm.prototype);
BValuation.prototype = Object.create(BTerm.prototype);
BRelation.prototype = Object.create(BTerm.prototype);

BType.prototype.constructor = BType;
BObject.prototype.constructor = BObject;
BValuation.prototype.constructor = BValuation;
BRelation.prototype.constructor = BRelation;

BTerm.prototype.getType = function() {
	return this.type;
};

BTerm.prototype.incLevel = function() {
	alert(purostr.invalidIncrement);
};

BTerm.prototype.hasVocab = function(vocab) {
	for(var i=0; i<this.inVocabs.length; i++){
		if(this.inVocabs[i]==vocab) return true;
	}
	return false;
};

BTerm.prototype.addVocab = function(vocab) {
	if(!this.hasVocab(vocab)) this.inVocabs.push(vocab);
};

BTerm.prototype.delVocab = function(vocab) {
	for(var i=0; i<this.inVocabs.length; i++){
		if(this.inVocabs[i]==vocab){ 
			this.inVocabs.splice(i,1);
			break;
		}
	}
};

BType.prototype.incLevel = function() {
	this.level = ++this.level;
};

BType.prototype.getType = function() {
	return this.type+" "+this.level;
};

function BLink(name, start, end) {
	this.name = name;
	this.start = start;
	this.end = end;
	this.source = start;
	this.target = end;
	this.right = true;
	this.left = false;
	this.id = -1;
} 

BLink.prototype.connectedTo = function(node) {
	if(this.start==node || this.end == node) return true;
	else return false;
};

function InstanceOfLink(name, start, end) {
	if((start instanceof BType || start instanceof BObject)
		&& end instanceof BType)
	BLink.call(this,purostr.BinstanceOf, start, end);
	else return null;
}

function SubTypeOfLink(name, start, end) {
	if(start instanceof BType && end instanceof BType)
		BLink.call(this,purostr.BsubTypeOf, start, end);
	else return null;
}

InstanceOfLink.prototype = Object.create(BLink.prototype);
SubTypeOfLink.prototype = Object.create(BLink.prototype);
InstanceOfLink.prototype.constructor = InstanceOfLink;
SubTypeOfLink.prototype.constructor = SubTypeOfLink;

function PuroModel() {
	this.links = [];
	this.nodes = [];
	this.idCounter = 0;
	this.name = "";
	this.oldId = null;
	this.vocabs = [];
}

PuroModel.prototype.addVocab = function(vocab) {
	newVocab = true;
	for(var i=0; i<this.vocabs.length; i++){
		if(this.vocabs[i]==vocab) newVocab = false;
	}
	if(newVocab) this.vocabs.push(vocab);
};

PuroModel.prototype.delVocab = function(vocab) {
	for(var i=0; i<this.vocabs.length; i++){
		if(this.vocabs[i]==vocab){ 
			this.vocabs.splice(i,1);
			break;
		}
	}
	
	for(var j = 0;j<this.nodes.length; j++) this.nodes[i].delVocab(vocab);
};

PuroModel.prototype.addNode = function(node) {
	if(node instanceof BType
		|| node instanceof BValuation
		|| node instanceof BRelation
		|| node instanceof BObject) {
			node.id = this.idCounter++;
			this.nodes.push(node);
			this.updateBTypeLevels();
		}
};

PuroModel.prototype.removeNode = function(node) {  
	for(var i=0; i<this.links.length; i++){
		if(this.links[i].connectedTo(node)) {
			this.links.splice(i,1);
			i--;
		}
	}
	this.nodes.splice(this.nodes.indexOf(node),1);
	this.updateBTypeLevels();
};

PuroModel.prototype.removeLink = function(link) {
	this.links.splice(this.links.indexOf(link),1);
	this.updateBTypeLevels();
};

PuroModel.prototype.empty = function() {
	while(this.links.length) {
		this.links.pop();
	}
	while(this.nodes.length) {
		this.nodes.pop();
	}
};

PuroModel.prototype.addLink = function(link) {
	link.id = this.idCounter++;
	this.links.push(link);
};

PuroModel.prototype.getNodeById = function(id) {
	for(var i=0; i<this.nodes.length; i++){
		if(this.nodes[i].id==id) return this.nodes[i];
	}
	return null;
};

PuroModel.prototype.updateCounter = function(idToCheck) {
	if(idToCheck>=this.idCounter) this.idCounter=idToCheck+1;
};

PuroModel.prototype.rebuildFrom = function(srcModel) {
	for(var i=0; i<srcModel.nodes.length; i++){
		newNode = null;
		switch(srcModel.nodes[i].type){
			case purostr.Btype: newNode = new BType(srcModel.nodes[i].name); break;
			case purostr.Bobject: newNode = new BObject(srcModel.nodes[i].name); break;
			case purostr.Bvaluation: newNode = new BValuation(srcModel.nodes[i].name); break;
			case purostr.Brelation: newNode = new BRelation(srcModel.nodes[i].name); break;
			default: newNode = new BTerm(srcModel.nodes[i].name);
		}
		newNode.id = srcModel.nodes[i].id;
		newNode.x = srcModel.nodes[i].x;
		newNode.y = srcModel.nodes[i].y;
		newNode.px = srcModel.nodes[i].px;
		newNode.py = srcModel.nodes[i].py;
		if(!(typeof srcModel.nodes[i].inVocabs === "undefined")) newNode.inVocabs = srcModel.nodes[i].inVocabs;
		this.updateCounter(newNode.id);
		this.nodes.push(newNode);
	}		
	
	for(var i=0; i<srcModel.links.length; i++){
		newLink = null;
		switch(srcModel.links[i].name){
			case purostr.BinstanceOf: newLink = new InstanceOfLink(srcModel.links[i].name, this.getNodeById(srcModel.links[i].start.id), this.getNodeById(srcModel.links[i].end.id)); break;
			case purostr.BsubTypeOf: newLink = new SubTypeOfLink(srcModel.links[i].name, this.getNodeById(srcModel.links[i].start.id), this.getNodeById(srcModel.links[i].end.id)); break;
			default: newLink = new BLink(srcModel.links[i].name, this.getNodeById(srcModel.links[i].start.id), this.getNodeById(srcModel.links[i].end.id));
		}
		newLink.startX = srcModel.links[i].startX;
		newLink.startY = srcModel.links[i].startY;
		newLink.endX = srcModel.links[i].endX;
		newLink.endY = srcModel.links[i].endY;
		if(typeof srcModel.links[i].id === "undefined") {
			this.addLink(newLink);
		}
		else {
			newLink.id = srcModel.links[i].id;
			this.updateCounter(newLink.id);
			this.links.push(newLink);
		}
	}
	
	this.name = srcModel.name;
	//this.id = srcModel.id;
	this.oldId = srcModel._id;
	this.oldRev = srcModel._rev;
	if(!(typeof srcModel.vocabs === "undefined")) this.vocabs = srcModel.vocabs;	
	this.updateBTypeLevels();
	//this._rev = srcModel._rev;
};

PuroModel.prototype.getLinks = function() {
	return this.links;
};

PuroModel.prototype.getNodes = function() {
	return this.nodes;
};

PuroModel.prototype.updateBTypeLevels = function () {
	var nodeStack = Array();
	this.ttl = 100;
	for(var n=0; n<this.nodes.length; n++) {
		this.nodes[n].level = 0;
		var isInstanceOf = false;
		var noIncoming = true;
		for(var link=0; link<this.links.length; link++) {
			if(this.links[link] instanceof InstanceOfLink && this.links[link].start == this.nodes[n])
				isInstanceOf = true;
			if(this.links[link] instanceof InstanceOfLink && this.links[link].end == this.nodes[n])
				noIncoming = false;
		}
		if(isInstanceOf && noIncoming) nodeStack.push(this.nodes[n]);
	}
	for(var n=0; n<nodeStack.length; n++) {
		this.updateBLevelsFrom(nodeStack[n]);
	}
	
};

PuroModel.prototype.updateBLevelsFrom = function(node) {
	this.ttl--;
	for(var link=0; link<this.links.length; link++) {
			if(this.links[link].start == node) {
				if(this.links[link].end.level < node.level+1) { 
					if(this.links[link] instanceof InstanceOfLink) {
						this.links[link].end.level = node.level+1;
						if(this.ttl>0) this.updateBLevelsFrom(this.links[link].end);
					}
				}
				if(this.links[link].end.level < node.level) {
					if(this.links[link] instanceof SubTypeOfLink) {
						this.links[link].end.level = node.level;
						if(this.ttl>0) this.updateBLevelsFrom(this.links[link].end);
					}
				}
			}
		}
};



