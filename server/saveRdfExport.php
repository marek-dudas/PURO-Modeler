<?php
if(isset($_FILES['rdfxml'])) {

    $file_name = $_FILES['rdfxml']['name'];
    $temp_file_location = $_FILES['rdfxml']['tmp_name'];

    $file_location = "rdf-export/".$file_name.".rdf";
    $purom_file = fopen($file_location, "w");
    $rdfInput = file_get_contents($temp_file_location);
    fwrite($purom_file, $rdfInput);
    fclose($purom_file);
    echo("file saved at $file_location");
}
?>
