<?php
	include 'settings.php';
	
	$patternsUrl = $patternsMultiUrl;

	set_time_limit(120);
	
	function getGraphs($str) {
		$graphs = array();
		$tokens = preg_split("/\s/", $str);
		$graph_names = preg_grep("/http:\/\/owlfragment[A-Z]/", $tokens);
		$graphs = array_unique($graph_names);
		return $graphs;
	}
		
	class Mapping {
		public $from;
		public $to;
		function __construct($from, $to, $to_parts) {
			$this->from = $from;
			$this->to = $to;
			$this->to_prefix = $to_parts->prefix;
			$this->to_name = $to_parts->name;
			$this->to_namespace = $to_parts->namespace;
		}
		function equals($otherMapping) {
			return ($this->from == $otherMapping->from && $this->to==$otherMapping->to);
		}
	}
	
	class Mappings {
		public $mappings;
		public $namespaces;
		function __construct() {
			$this->mappings = array();
		}
		function addMapping($mapping) {
			$shouldAdd = true;
			foreach($this->mappings as $m) if($m->equals($mapping)) $shouldAdd = false;
			if($shouldAdd) $this->mappings[] = $mapping;
		}
		function setNamespaces($namespaces) {
			$this->namespaces = $namespaces;
		}
	}
	
	class Mapper {
		public $mappingResult;
		private $transformMap;
		private $prefixResolver;
	
		function __construct() {
			$this->mappingResult = new Mappings();
			$this->prefixResolver = new PrefixStore();
		}
		
		function extractGraph($graphName, $lines) {
			$this->transformMap = array();
			$graphLines = preg_grep("/".$graphName."/", $lines);
			$graph = "";
			foreach ($graphLines as $line) {
				if(strpos($line, "<http://lod2-dev.vse.cz/ontology/puro#transformedTo>") === FALSE)
					$graph .= str_replace(" <http://".$graphName.">", "", $line);
				else {
					$match_result = preg_match("/<(?P<from>[^>]+)>\s<[^>]*>\s<(?P<to>[^>]+)/", $line, $mapTriple);
					if($match_result == 1) $this->transformMap[$mapTriple["to"]] = $mapTriple["from"];
					else echo "<br><br>-----Match error----<br>match result:$match_result<br>line:$line<br>";
				}
			}
			return $graph;
		}

		function getMappings($mappingUrl, $fragmentUrl) {
			$ch = curl_init();
			// set url
			curl_setopt($ch, CURLOPT_URL, $mappingUrl.$fragmentUrl."&threshold=0.5");
			//return the transfer as a string
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			$xmlMapping = curl_exec($ch);
			// close curl resource to free up system resources
			curl_close($ch);
			
			libxml_use_internal_errors(true);
					
			$xmlObject = simplexml_load_string($xmlMapping);
			if ($xmlObject === false) {
			    echo "mapping request: ".$mappingUrl.$fragmentUrl."&threshold=0.5";
				echo "Failed loading XML: ";
				foreach(libxml_get_errors() as $error) {
					echo "<br>", $error->message;
				}
				echo "---------the response was--------";
				echo $xmlMapping;
			} else {
				foreach($xmlObject->mapping as $mapping) {
					//$attributes = $mapping->attributes();
					if(array_key_exists($mapping["entity1"]->__toString(), $this->transformMap)) {
						$this->mappingResult->addMapping(new Mapping($this->transformMap[$mapping["entity1"]->__toString()], 
								$mapping["entity2"]->__toString(), 
								$this->prefixResolver->resolvePrefix($mapping["entity2"]->__toString())));
					}
				}
			}
		}
		
		function storeNamespaces() {
			$this->mappingResult->setNamespaces($this->prefixResolver->getPrefixMappings());
		}
	}
	
	class EntityIdentifier {
		public $name;
		public $prefix;
		public $namespace;
		
		function __construct($uri, $prefix, $namespace) {			
			$this->name = substr($uri, strlen($namespace));
			$this->prefix = $prefix;
			$this->namespace = $namespace;
		}
	}
	
	class NS {
		public $str;
		public $prefix;
		public $namespace;
	
		function __construct($prefix, $namespace) {
			$this->str = $prefix.": ".$namespace;
			$this->prefix = $prefix;
			$this->namespace = $namespace;
		}
	}
	
	class PrefixStore {
		public $namespaces;
		public $prefixes;
		private $prefixCount;
		
		function __construct() {
			$this->namespaces = array();
			$this->prefixes = array();
			$this->prefixCount = 0;
		}
		
		function resolvePrefix($entityUri) {
			preg_match("/^(?P<namespace>.*[\/#])(?P<name>[^\/^#]+)$/", $entityUri, $parts);
			$namespaceUri = $parts["namespace"];
			
			$prefixIndex = array_search($namespaceUri, $this->namespaces);
			if(!($prefixIndex === false)) return new EntityIdentifier($entityUri, $this->prefixes[$prefixIndex], $namespaceUri);
				
			$url = "http://prefix.cc/reverse?uri=".urlencode($namespaceUri)."&format=json";
								
			$ch = curl_init();
			// set url
			curl_setopt($ch, CURLOPT_URL, $url);
			//return the transfer as a string
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			// $output contains the output string
			$content = curl_exec($ch);
			// close curl resource to free up system resources
			curl_close($ch);
				
			$ccprefixes = json_decode($content);
			if($ccprefixes!=null) {
				foreach($ccprefixes as $prefix => $namespace) {
					$this->prefixes[] = $prefix;
					$this->namespaces[] = $namespace;
					return new EntityIdentifier($entityUri, $prefix, $namespace);
				}
			}
			else {
				$this->prefixCount++;
				$autoPrefix = "ns$this->prefixCount";
				$this->prefixes[] = $autoPrefix;
				$this->namespaces[] = $namespaceUri;
				return new EntityIdentifier($entityUri, $autoPrefix, $namespaceUri);
			}
		}
		
		function getPrefixMappings() {
			$mappings = array();
			for($i=0; $i<count($this->prefixes); $i++) {
				$mappings[] = new NS($this->prefixes[$i], $this->namespaces[$i]);
			}
			return $mappings;
		}
	}
	
	$purom_filename = uniqid().".rdf";
	$purom_file = fopen($purom_filename, "w");	
	$rdfInput = null;
	if($debug_solo) $rdfInput = file_get_contents("test.rdf");
	else $rdfInput = file_get_contents('php://input');
	fwrite($purom_file, $rdfInput);	
	fclose($purom_file);
	
	//debug save puromodel at protegeserver
	if($debug)
	{
		//echo "copying the model to protegeserver <br>";
		$webUrl = "http://protegeserver.cz/purom/server/";
		$debug_save_url = "http://protegeserver.cz/purom/server/savetempmodel.php";
		$patternsUrl = "http://protegeserver.cz/purom/OBOWLMorph/patterns-multi/";
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
    $transformation_data = "puro-model=$webUrl$purom_filename&"
    		."transformation-pattern=$patternsUrl"."binaryRelation-toObjProp.txt&"
    		."transformation-pattern=$patternsUrl"."naryRelation-incomingLink.txt&"
    		."transformation-pattern=$patternsUrl"."naryRelation-toPartialObjProp.txt&"
    		."transformation-pattern=$patternsUrl"."naryRelation-attribute.txt&"
    		."transformation-pattern=$patternsUrl"."objectManifestation.txt&"
    		."transformation-pattern=$patternsUrl"."subtype-toSubClass.txt&"
    		."transformation-pattern=$patternsUrl"."fragment_annot.txt";
    
    //echo "transformationData: $transformation_data\r\n";
    //echo "puro-model-url: $webUrl$purom_filename\r\n";
    
	
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
	$mapper = new Mapper();
	if($debug) {
		$transformationResultFile = fopen("transformResult.nq", "w");
		
		//$rdfInput = file_get_contents('php://input');
		
		fwrite($transformationResultFile, $owlFragments);
		
		fclose($transformationResultFile);
	}
	foreach($graphs as $graph_URI) {
		$graph = trim($graph_URI,"<>");
		$graph = str_replace("http://", "", $graph);
		$file_name = $graph."_".uniqid().".nq";
		$graph_files[$graph] = $file_name;
		$graph_file = fopen($file_name, "w");
		$graph_data = $mapper->extractGraph($graph, $nqLines);
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
		$mapper->getMappings($mappingUrl, $webUrl.$file_name);
		$i++;
	}
	$mapper->storeNamespaces();
	echo json_encode($mapper->mappingResult);
?>