<?php
	$purom_filename = $_REQUEST["filename"];
	$purom_file = fopen($purom_filename, "w");
	
	//$rdfInput = file_get_contents('php://input');
	
	fwrite($purom_file, $_REQUEST["graph_data"]);
	
	fclose($purom_file);
	
	echo "done";
?>