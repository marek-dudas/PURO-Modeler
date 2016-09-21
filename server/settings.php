<?php 
	$debug = true;
	$debug_solo = false;
	$serverRoot = "http://lod2-dev.vse.cz/puromodeler-v3.5";
	$webUrl = "$serverRoot/server/"; //"http://lod2-dev.vse.cz/puromodeler-v4/server/";
	$mappingUrl = "http://owl.vse.cz:8080/OWLFragmentMapping/match?owl-fragment=";
	$patternsMultiUrl = "$serverRoot/OBOWLMorph/patterns-multi/"; //"http://lod2-dev.vse.cz/puromodeler/patterns/";		
    $transformation_url = "http://owl.vse.cz:8080/OBOWLMorphTransformation/transform1";
	$patternsSingleUrl = "$serverRoot/OBOWLMorph/patterns/"; //"http://lod2-dev.vse.cz/puromodeler-v4/OBOWLMorph/patterns";
	$vowlUrl = "http://vowl.visualdataweb.org/webvowl/index.html#iri=";
	$couchUrl = "http://admin:c0d1988@lod2-dev.vse.cz:5984/puromodels2/"; //"http://admin:c0d1988@protegeserver.cz/couchdb/puromodels/";
	if($debug) $couchUrl = "http://localhost/couchdb/puromodels2/";
?>