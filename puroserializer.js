BTerm.prototype.rdfDefine = function() {
	PuroRdfSerializer.defineBElement(this.getPuroTerm(), this.getRdfName(), this.getCURI(), this);
};

BAttribute.prototype.rdfDefine = function () {
    PuroRdfSerializer.defineBElement(this.getPuroTerm(), this.getRdfName(), this.getCURI(), this);
};

BLink.prototype.rdfDefine = function() {
	if(this.getRdfName() != "" && !(this.end instanceof BValuation) && !(this.end.getType() == "mapping"))
		PuroRdfSerializer.defineBElement(puroOntology.link, this.getTrimmedName(), this.getCURI());
	// else if( this.end instanceof BValuation ) { //special treatment of attribute->valuation links
	// 	var attributeUri = "pm:"+this.getTrimmedName();
	// 	PuroRdfSerializer.defineBElement(puroOntology.Battribute, this.getTrimmedName(), attributeUri);
	// 	var valuationUri = "pm:"+this.getTrimmedName()+"_"+this.end.getRdfName();
	// 	PuroRdfSerializer.defineBElement(puroOntology.Bvaluation, this.getTrimmedName()+"_"+this.end.getRdfName(), valuationUri, this.end);
	// 	PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:linkedTo", valuationUri);
	// 	PuroRdfSerializer.addTriple(valuationUri, "puro:linkedTo", attributeUri);
	// }
};

InstanceOfLink.prototype.rdfDefine = function() {
	//do nothing
};

SubTypeOfLink.prototype.rdfDefine = function() {
	//do nothing
};

BLink.prototype.rdfLink = function(noLinkNames = false) {
	// valuation links are treated specially and by rdfDefine
	if(! (this.end instanceof BValuation))	{
		if(this.getTrimmedName()=="" || noLinkNames)
			PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:linkedTo",this.end.getCURI());
		else if(this.end.getType() == "mapping") {
			PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:mappedTo", this.end.getURI());
		}
		else {
			PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:linkedTo", this.getCURI());
			PuroRdfSerializer.addTriple(this.getCURI(), "puro:linkedTo", this.end.getCURI());
		}
	}
};

InstanceOfLink.prototype.rdfLink = function() {
	PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:instanceOf", this.end.getCURI());
};

SubTypeOfLink.prototype.rdfLink = function() {
	PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:subTypeOf", this.end.getCURI());
};

var PuroRdfSerializer = {};

PuroRdfSerializer.addTriple = function(s, p, o) {
	//this.data.add($.rdf.triple(s,p,o));
	this.data.add($.rdf.triple(s+" "+p+" "+o+" .", {
		namespaces: {
			puro: 'http://lod2-dev.vse.cz/ontology/puro#',
			pm: 'http://lod2-dev.vse.cz/data/puromodels#',
			rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
			rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
		}
	}));
};

PuroRdfSerializer.createResource = function(r) {
	return $.rdf.resource(r, {
		namespaces: {
			puro: 'http://lod2-dev.vse.cz/ontology/puro#',
			pm: 'http://lod2-dev.vse.cz/data/puromodels#',
			rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
			rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
		}
	});
};

PuroRdfSerializer.defineBElement = function(elementType, elementName, elementCuri, bElement) {
	/*this.addTriple(PuroRdfSerializer.createResource(elementCuri),
			PuroRdfSerializer.createResource('rdf:type'),
			PuroRdfSerializer.createResource('puro:'+elementType));
	this.addTriple(PuroRdfSerializer.createResource(elementCuri),
			PuroRdfSerializer.createResource('rdfs:label'),
			$.rdf.literal('"'+elementName+'"'));*/

	this.addTriple(elementCuri,
			'rdf:type',
			'puro:'+elementType);
	this.addTriple(elementCuri,
			'rdfs:label',
			'"'+elementName+'"');

	if(bElement!=null) {
		this.addTriple(elementCuri, 'puro:modelingStyle', 'puro:'+bElement.modelingStyle.name);
		this.addTriple(elementCuri, 'puro:rigid', '"'+(!bElement.fluent)+'"');
	}
};

//PuroRdfSerializer.data = {}; //TBD

PuroRdfSerializer.initData = function(targetWindow){
	this.data = $.rdf.databank()
		.prefix('puro', 'http://lod2-dev.vse.cz/ontology/puro#')
		.prefix('pm', 'http://lod2-dev.vse.cz/data/puromodels#')
		.prefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
		//.prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
};

PuroRdfSerializer.upload = function(targetWindow) {
	var dataDOM = this.data.dump({format:'application/rdf+xml'});
	var dataString = (new XMLSerializer()).serializeToString(dataDOM);
	$.post(
			transformServerUrl, //http://localhost/PUROM-server/
		  dataString
		)
		.done(function( data ) {

			targetWindow.document.write(data);
		  });
};

function serializaAttribute (model, attribute) {
	var inlink = null, outlink = null;
    for(var i=0; i<model.links.length; i++) {
        if (model.links[i].end === attribute) inlink = model.links[i];
    	if (model.links[i].start === attribute) outlink = model.links[i];
	}
	if(inlink && outlink) {
        var attributeUri = "pm:"+attribute.getRdfName();
        PuroRdfSerializer.defineBElement(puroOntology.Battribute, attribute.getRdfName(), attributeUri);
        var valuationUri = "pm:"+attribute.getRdfName()+"_"+outlink.end.getRdfName();
        PuroRdfSerializer.defineBElement(puroOntology.Bvaluation, attribute.getRdfName()+"_"+outlink.end.getRdfName(), valuationUri, outlink.end);
        PuroRdfSerializer.addTriple(inlink.start.getCURI(), "puro:linkedTo", valuationUri);
        PuroRdfSerializer.addTriple(valuationUri, "puro:linkedTo", attributeUri);
	}
}

PuroRdfSerializer.serialize = function(model, noLinkNames = false) {
for(var i=0; i<model.nodes.length; i++)
	if(model.nodes[i] instanceof BAttribute) serializaAttribute(model, model.nodes[i]);
	else if(!(model.nodes[i] instanceof BValuation || model.nodes[i].getType()=="mapping")) model.nodes[i].rdfDefine();
for(var i=0; i<model.links.length; i++)
	model.links[i].rdfDefine();
for(var i=0; i<model.links.length; i++)
	model.links[i].rdfLink(noLinkNames);
}


PuroRdfSerializer.uploadRdfExport = function (model, callback) {

	var xhr = new XMLHttpRequest();
	var formData = new FormData();
	this.initData();
	this.serialize(model, true);
	var dataDOM = this.data.dump({format:'application/rdf+xml'});
	var dataString = (new XMLSerializer()).serializeToString(dataDOM);
	var blob = new Blob([dataString], {type: 'application/rdf+xml;charset=utf-8'});
	var file = new File([blob], PuroEditor.control.currentModelId);
	xhr.open('POST', saveExportUrl, true);
	if (callback) {
		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE) callback();
		};
	}
	formData.append('rdfxml', file);
	xhr.send(formData);
};

PuroRdfSerializer.getOFMVisualizationUrl = function(model, callback) {
	this.initData();
	this.serialize(model);
	var dataDOM = this.data.dump({format:'application/rdf+xml'});
	var dataString = (new XMLSerializer()).serializeToString(dataDOM);
	$.post(
			obowlmorphServerUrl, //http://localhost/PUROM-server/
		  dataString
		)
		.done(callback);
}

PuroRdfSerializer.getMappings = function(model, callback) {
	this.initData();
	this.serialize(model);
	var dataDOM = this.data.dump({format:'application/rdf+xml'});
	var dataString = (new XMLSerializer()).serializeToString(dataDOM);
	$.post(
			mappingServerUrl, //http://localhost/PUROM-server/
		  dataString
		)
		.done(callback);
};

PuroRdfSerializer.transformToVariants = function(model) {
	var win = window.open("", "_blank", "scrollbars=yes, width=900, height=800");
	this.initData();

	this.serialize(model);

	this.upload(win);

};
