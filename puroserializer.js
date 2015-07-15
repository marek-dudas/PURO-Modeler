BTerm.prototype.rdfDefine = function() {
	PuroRdfSerializer.defineBElement(this.getPuroTerm(), this.getRdfName(), this.getCURI())
};

BLink.prototype.rdfDefine = function() {
	if(this.getRdfName() != "" && !(this.end instanceof BValuation))
		PuroRdfSerializer.defineBElement(puroOntology.link, this.getTrimmedName(), this.getCURI());
	else if( this.end instanceof BValuation ) { //special treatment of attribute->valuation links
		var attributeUri = "pm:"+this.getTrimmedName();
		PuroRdfSerializer.defineBElement(puroOntology.Battribute, this.getTrimmedName(), attributeUri);
		var valuationUri = "pm:"+this.getTrimmedName()+"_"+this.end.getRdfName();
		PuroRdfSerializer.defineBElement(puroOntology.Bvaluation, this.getTrimmedName()+"_"+this.end.getRdfName(), valuationUri);
		PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:linkedTo", valuationUri);
		PuroRdfSerializer.addTriple(valuationUri, "puro:linkedTo", attributeUri);
	}
};

InstanceOfLink.prototype.rdfDefine = function() {
	//do nothing
};

SubTypeOfLink.prototype.rdfDefine = function() {
	//do nothing
};

BLink.prototype.rdfLink = function() {
	// valuation links are treated specially and by rdfDefine
	if(! (this.end instanceof BValuation))	{
		if(this.getTrimmedName()=="") 
			PuroRdfSerializer.addTriple(this.start.getCURI(), "puro:linkedTo",this.end.getCURI());
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

PuroRdfSerializer.defineBElement = function(elementType, elementName, elementCuri) {
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
};

//PuroRdfSerializer.data = {}; //TBD

PuroRdfSerializer.initData = function(targetWindow){
	this.data = $.rdf.databank()
		.prefix('puro', 'http://lod2-dev.vse.cz/ontology/puro#')
		.prefix('pm', 'http://lod2-dev.vse.cz/data/puromodels#')
		.prefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#')
		.prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
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

PuroRdfSerializer.serialize = function(model) {
	var win = window.open("", "_blank", "scrollbars=yes, width=900, height=800");
	this.initData();
	
	for(var i=0; i<model.nodes.length; i++)
		model.nodes[i].rdfDefine();
	for(var i=0; i<model.links.length; i++)
		model.links[i].rdfDefine();
	for(var i=0; i<model.links.length; i++)
		model.links[i].rdfLink();	
	
	this.upload(win);
	
};