<?php 
	$debug = false;
	$debug_solo = false;
	$serverRoot = http://protegeserver.cz/purom4 //"http://localhost/purom"; //"http://lod2-dev.vse.cz/puromodeler-v3.5";
	if($debug) $serverRoot = http://localhost/purom
	$webUrl = "$serverRoot/server/"; //"http://lod2-dev.vse.cz/puromodeler-v4/server/";
	$mappingUrl = "https://owl.vse.cz/OWLFragmentMapping/match?owl-fragment=";
	$patternsMultiUrl = "$serverRoot/OBOWLMorph/patterns-multi/"; //"http://lod2-dev.vse.cz/puromodeler/patterns/";		
    $transformation_url = "https://owl.vse.cz/OBOWLMorphTransformation/transform1";
	$patternsSingleUrl = "$serverRoot/OBOWLMorph/patterns/"; //"http://lod2-dev.vse.cz/puromodeler-v4/OBOWLMorph/patterns";
	$vowlUrl = "http://rknown.vserver.cz:8080/webvowl_1.0.4/#iri="; //"http://visualdataweb.de/webvowl/#iri=";
	$couchUrl = "http://admin:c0d1988@protegeserver.cz/couchdb/puromodels/"; //"http://admin:c0d1988@protegeserver.cz/couchdb/puromodels/";
	if($debug) $couchUrl = "http://localhost/couchdb/puromodels2/";
?>