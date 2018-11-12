var serverRoot = "http://protegeserver.cz/purom4/";

var couchdbUrl = "http://admin:c0d1988@protegeserver.cz/couchdb/puromodels/"; //"http://localhost/couchdb/puromodels2/";//"http://admin:c0d1988@lod2-dev.vse.cz/couchdb/puromodels2/"; //"http://localhost/couchdb/puromodels/""http://user:pasword@protegeserver.cz/couchdb";

var transformServerUrl = serverRoot+"server/purom-transform.php";  //"http://localhost/PUROM-server/purom-transform.php""http://lod2-dev.vse.cz/puromodeler/server/purom-transform.php";

var obowlmorphServerUrl = serverRoot+"server/obowlmorph.php";//"http://localhost/puromodeler/server/obowlmorph.php";http://lod2-dev.vse.cz/puromodeler-v2/server/obowlmorph.php

var mappingServerUrl = serverRoot+"server/mappings.php"

var couchLoginUrl = serverRoot+"server/login.php";

var couchProxyUrl = serverRoot+"server/couchProxy.php";

var sessionUrl = serverRoot+"server/session.php";

var vowlUrl = "http://rknown.vserver.cz:8080/webvowl_1.0.4/#iri=";

var vocabsDiv = "vocabs";

var vocabHighlightUpdateRate = 50;

var vocabHighlightRadius = 18;

var vocabPathWidth = 2;

var obmListTableElement = "obmTable";

var PuroAppSettings = {
		vocabComparisonEnabled: true,
		obmToolboxEnabled: true,
		modelingStyleBoxEnabled: false,
		mappingBoxEnabled: false,
		vocabVisualizationEnabled: true,
		debug: true,
		loadDebugJson: true,
		setEditorFunctionality: function() {
			this.vocabComparisonEnabled = true;
			this.obmToolboxEnabled = true;
			this.modelingStyleBoxEnabled = false;
			this.mappingBoxEnabled = false;
			this.vocabVisualizationEnabled = true;
		},
		setOBOWLMorphFunctionality: function() {
			this.vocabComparisonEnabled = false;
			this.obmToolboxEnabled = false;
			this.modelingStyleBoxEnabled = true;
			this.mappingBoxEnabled = true;
			this.vocabVisualizationEnabled = true;
		}
};

if(PuroAppSettings.debug) {
	
	serverRoot = "http://localhost/purom";
	
	couchdbUrl = "http://localhost/couchdb/puromodels2/"; //"http://admin:c0d1988@protegeserver.cz/couchdb/puromodels"//"http://localhost/couchdb/puromodels2/";//"http://admin:c0d1988@lod2-dev.vse.cz/couchdb/puromodels2/"; //"http://localhost/couchdb/puromodels/""http://user:pasword@protegeserver.cz/couchdb";

	transformServerUrl = serverRoot+"/server/purom-transform.php";  //"http://localhost/PUROM-server/purom-transform.php""http://lod2-dev.vse.cz/puromodeler/server/purom-transform.php";

	obowlmorphServerUrl =  serverRoot+"/server/obowlmorph.php";//"http://localhost/puromodeler/server/obowlmorph.php";http://lod2-dev.vse.cz/puromodeler-v2/server/obowlmorph.php

	mappingServerUrl =  serverRoot+"/server/mappings.php"

	couchLoginUrl =  serverRoot+"/puromodeler/server/login.php";

	vowlUrl = "http://rknown.vserver.cz:8080/webvowl_1.0.4/#iri=";
	
	couchProxyUrl =  serverRoot+"/server/couchProxy.php";
	
	sessionUrl =  serverRoot+"/server/session.php";
}