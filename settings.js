var serverRoot = "http://lod2-dev.vse.cz/puromodeler-v3.5/";

var couchdbUrl = "http://admin:c0d1988@protegeserver.cz/couchdb/puromodels/"; //"http://localhost/couchdb/puromodels2/";//"http://admin:c0d1988@lod2-dev.vse.cz/couchdb/puromodels2/"; //"http://localhost/couchdb/puromodels/""http://user:pasword@protegeserver.cz/couchdb";

var transformServerUrl = serverRoot+"server/purom-transform.php";  //"http://localhost/PUROM-server/purom-transform.php""http://lod2-dev.vse.cz/puromodeler/server/purom-transform.php";

var obowlmorphServerUrl = serverRoot+"server/obowlmorph.php";//"http://localhost/puromodeler/server/obowlmorph.php";http://lod2-dev.vse.cz/puromodeler-v2/server/obowlmorph.php

var mappingServerUrl = serverRoot+"server/mappings.php"

var couchLoginUrl = serverRoot+"server/login.php";

var couchProxyUrl = serverRoot+"server/couchProxy.php";

var vowlUrl = "http://vowl.visualdataweb.org/webvowl/index.html#iri=";

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
		loadDebugJson: false,
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
	
	couchdbUrl = "http://localhost/couchdb/puromodels2/"; //"http://admin:c0d1988@protegeserver.cz/couchdb/puromodels"//"http://localhost/couchdb/puromodels2/";//"http://admin:c0d1988@lod2-dev.vse.cz/couchdb/puromodels2/"; //"http://localhost/couchdb/puromodels/""http://user:pasword@protegeserver.cz/couchdb";

	transformServerUrl = "http://localhost/puromodeler/server/purom-transform.php";  //"http://localhost/PUROM-server/purom-transform.php""http://lod2-dev.vse.cz/puromodeler/server/purom-transform.php";

	obowlmorphServerUrl = "http://localhost/puromodeler/server/obowlmorph.php";//"http://localhost/puromodeler/server/obowlmorph.php";http://lod2-dev.vse.cz/puromodeler-v2/server/obowlmorph.php

	mappingServerUrl = "http://localhost/puromodeler/server/mappings.php"

	couchLoginUrl = "http://localhost/puromodeler/server/login.php";

	vowlUrl = "http://vowl.visualdataweb.org/webvowl/index.html#iri=";
	
	couchProxyUrl = "http://localhost/puromodeler/server/couchProxy.php";
}