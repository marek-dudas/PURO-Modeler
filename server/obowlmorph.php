<?php
	
	include 'settings.php';
	
	$patternsUrl = $patternsSingleUrl;
	
	class TransformationResult {
		public $vowlUrl;
		public $downloadUrl;
		function __construct($vowlUrl, $downloadUrl) {
			$this->vowlUrl = $vowlUrl;
			$this->downloadUrl = $downloadUrl;
		}
	}
	
	function getGraphs($str) {
		$graphs = array();
		$tokens = preg_split("/\s/", $str);
		$graph_names = preg_grep("/http:\/\/owlfragment[A-Z]/", $tokens);
		$graphs = array_unique($graph_names);
		return $graphs;
	}
	
	function extractGraph($graphName, $lines) {
		$graphLines = preg_grep("/".$graphName."/", $lines);
		$graph = "";
		foreach ($graphLines as $line) {
			if(strpos($line, "<http://lod2-dev.vse.cz/ontology/puro#transformedTo>") === FALSE)
				$graph .= str_replace(" <http://".$graphName.">", "", $line);
		}
		return $graph;
	}	
	
		$purom_filename = uniqid().".rdf";
		$purom_file = fopen($purom_filename, "w");
		$rdfInput = null;
		if($debug_solo) $rdfInput = file_get_contents('57852d8b8bb83.rdf');	
		else $rdfInput = file_get_contents('php://input');
		fwrite($purom_file, $rdfInput);	
		fclose($purom_file);
	
	//debug save puromodel at protegeserver
	if($debug)
	{
		//echo "copying the model to protegeserver <br>";
		$webUrl = "http://protegeserver.cz/purom/server/";
		$debug_save_url = "http://protegeserver.cz/purom/server/savetempmodel.php";
		$patternsUrl = "http://protegeserver.cz/purom/OBOWLMorph/patterns";
		$ch = curl_init();   
	    curl_setopt($ch,CURLOPT_URL,$debug_save_url);
	    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded')); //array('Content-Type: text/plain')); 
	    curl_setopt($ch, CURLOPT_POST, 2);
	    curl_setopt($ch, CURLOPT_POSTFIELDS, "filename=$purom_filename&graph_data=$rdfInput");     
	    $output=curl_exec($ch); 
	    //echo "protegeserver answer: $output";
	    curl_close($ch);
	}
    
    //run the transformation
    $transformation_url = "http://owl.vse.cz:8080/OBOWLMorphTransformation/transform1";
    $transformation_data = "puro-model=$webUrl$purom_filename&"
    		."transformation-pattern=$patternsUrl/2rel_to_classMembership.txt&"
    		."transformation-pattern=$patternsUrl/2rel_to_dataProp.txt&"
    		."transformation-pattern=$patternsUrl/2rel_to_objProp.txt&"
    		."transformation-pattern=$patternsUrl/2rel_to_reification.txt&"
    		."transformation-pattern=$patternsUrl/nrelIncomingLink_to_objProp.txt&"
    		."transformation-pattern=$patternsUrl/nrelMember_to_dataProp.txt&"
    		."transformation-pattern=$patternsUrl/nrelMember_to_objProp.txt&"
    		."transformation-pattern=$patternsUrl/nrelValuation_to_dataProp.txt&"
    		."transformation-pattern=$patternsUrl/nrelValuation_to_objProp.txt&"
    		."transformation-pattern=$patternsUrl/objectManifestation.txt&"
    		."transformation-pattern=$patternsUrl/subType_to_objProp.txt&"
    		."transformation-pattern=$patternsUrl/subType_to_subClass.txt&"
    		."transformation-pattern=$patternsUrl/cancel_multidomain.txt&"
    		."transformation-pattern=$patternsUrl/cancel_multirange.txt&"
    		."transformation-pattern=$patternsUrl/fragment_annot.txt";
    
    $purom_file = fopen("transform-debug.txt", "w");
    //$rdfInput = file_get_contents('php://input');
    fwrite($purom_file, $transformation_data);
    fclose($purom_file);
    
	$ch = curl_init();
	// set url
	curl_setopt($ch, CURLOPT_URL, $transformation_url);
	//return the transfer as a string
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);	
	curl_setopt($ch, CURLOPT_POST, 7);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $transformation_data);
	// $output contains the output string
	$owlFragments = curl_exec($ch);
	// close curl resource to free up system resources
	curl_close($ch);
	
	//echo $owlFragments;

	$graphs = getGraphs($owlFragments);
	$graphFiles = array();
	$nqLines = preg_split("/\n/",$owlFragments);
	$modeling_style_ids = array('A', 'B', 'C', 'D');
	$i = 0;
	
	$results = array();
	foreach($graphs as $graph_URI) {
		$graph = trim($graph_URI,"<>");
		$graph = str_replace("http://", "", $graph);
		$file_name = $graph."_".uniqid().".nq";
		$graph_files[$graph] = $file_name;
		$graph_file = fopen($file_name, "w");
		$graph_data = extractGraph($graph, $nqLines);
		fwrite($graph_file, $graph_data);
		fclose($graph_file);
		if($debug)
		{
			//echo "copying the results to protegeserver <br>";
			$debug_save_url = "http://protegeserver.cz/purom/server/savetempmodel.php";
			$ch = curl_init();
			curl_setopt($ch,CURLOPT_URL,$debug_save_url);
			curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
			curl_setopt($ch, CURLOPT_POST, 2);
			curl_setopt($ch, CURLOPT_POSTFIELDS, "filename=$file_name&graph_data=$graph_data");
			$output=curl_exec($ch);
			curl_close($ch);
			//echo $output."<br>";
		}
		
		$results[] = new TransformationResult("$vowlUrl$webUrl$file_name", "$webUrl$file_name");
		
		$i++;
	}
	
	echo json_encode($results);
?>