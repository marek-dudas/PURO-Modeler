<html>
	<head>
		<title>OWL Ontology Fragments Generated from OBM</title>
		<style>
		body
{ font: normal .80em trebuchet ms, sans-serif;
  background: #fff;
  color: #5D5D5D;}

p
{ padding: 0 0 20px 0;
  line-height: 1.7em;}

img
{ border: 0;}

h1, h2, h3, h4, h5, h6 
{ font: normal 165% 'century gothic', arial, sans-serif;
  color: #2DB8CD;
  margin: 0 0 14px 0;
  padding: 10px 0 5px 0;}

h2
{ font: normal 165% 'century gothic', arial, sans-serif;
  color: #B60000;}

h3
{ font: normal 165% 'century gothic', arial, sans-serif;}

h4, h5, h6
{ margin: 0;
  padding: 0 0 5px 0;
  font: normal 120% arial, sans-serif;
  color: #B60000;}

h5, h6
{ font: italic 95% arial, sans-serif;
  color: #888;}

h6
{ color: #362C20;}

a, a:hover
{ outline: none;
  text-decoration: underline;
  color: #A4AA04;}

a:hover
{ text-decoration: none;}
</style>
		</head>
		<body>
		<h4>Generated OWL Ontology Fragments</h4>
		<i>Visualized with <a href="http://vowl.visualdataweb.org/webvowl.html">WebVOWL</a>. Loading may need some time, please be patient.</i>
		<br>
		<br>
<?php
	
	$debug = false;
	$webUrl = "http://lod2-dev.vse.cz/puromodeler/server/";
	$vowlUrl = "http://vowl.visualdataweb.org/webvowl/index.html#iri=";
	
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
		$rdfInput = file_get_contents('php://input');
		fwrite($purom_file, $rdfInput);	
		fclose($purom_file);
	
	//debug save puromodel at protegeserver
	if($debug)
	{
		//echo "copying the model to protegeserver <br>";
		$webUrl = "http://lod2-dev.vse.cz/puromodeler/patterns/";
		$debug_save_url = "http://192.168.1.2/puromodeler/patterntest/savetempmodel.php";
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
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/binaryRelation-toObjProp.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/naryRelation-incomingLink.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/naryRelation-toPartialObjProp.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/naryRelation-attribute.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/objectManifestation.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/subtype-toSubClass.txt&"
    		."transformation-pattern=http://lod2-dev.vse.cz/puromodeler/patterns/fragment_annot.txt";
	
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
			$debug_save_url = "http://192.168.1.2/puromodeler/patterntest/savetempmodel.php";
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
		echo "<b>OWL Representation: Modeling Style \"$modeling_style_ids[$i]\"</b> <a href=\"$webUrl$file_name\" download> download this one </a>";
		echo "<iframe style=\"margin: 10px\" src=\"$vowlUrl$webUrl$file_name\" width=\"100%\" height=\"500\"></iframe>";
		echo "<br>";
		$i++;
	}
?>
</body>
</html>