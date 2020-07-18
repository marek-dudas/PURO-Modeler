<?php
	include 'settings.php';

	class CouchProxy {
		private $couchUrl;

		function __construct($couchUrl) {
			$this->couchUrl = $couchUrl;
		}

		function exec_curl_get($couchPartUrl) {
			$ch = curl_init();
			//$f = fopen('request.txt', 'w');

			curl_setopt($ch,CURLOPT_URL,$this->couchUrl.$couchPartUrl);
			curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded',
                														'Accept: application/javascript, application/json'));
			curl_setopt($ch, CURLOPT_POST, FALSE);
			curl_setopt($ch, CURLOPT_HTTPGET, TRUE);
			//curl_setopt($ch, CURLOPT_STDERR, $f);
			//curl_setopt($ch, CURLOPT_VERBOSE, 1);
			$output=curl_exec($ch);
			curl_close($ch);
            //fclose($f);
			return $output;
		}

		function get_all_docs() {
			echo $this->exec_curl_get("_all_docs?include_docs=true");
		}

		function get_doc($doc) {
			echo $this->exec_curl_get($doc);
		}

		function put_doc($docId, $doc_data) {
			/*$docdata_filename = "puromodelToSave_".uniqid().".json";
			$docdata_file = fopen($docdata_filename, "w");
			fwrite($docdata_file, $doc_data);
			fclose($docdata_file);

			$docdata_file = fopen($docdata_filename, "r");*/

			$ch = curl_init();

			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch,CURLOPT_URL,$this->couchUrl.$docId);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json',
														'Accept: application/javascript, application/json'));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
			curl_setopt($ch, CURLOPT_POSTFIELDS,$doc_data);
			$output=curl_exec($ch);
			curl_close($ch);
			//fclose($docdata_file);
			//unlink($docdata_filename);
			echo $output;
		}

		function read_and_add_doc() {
			$doc_data = file_get_contents('php://input');

			/*$docdata_filename = "puromodelToAdd_".uniqid().".json";
			$docdata_file = fopen($docdata_filename, "w");
			fwrite($docdata_file, $doc_data);
			fclose($docdata_file);

			$docdata_path = realpath($docdata_filename);*/

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_URL, $this->couchUrl);
			//return the transfer as a string
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json',
														'Accept: application/javascript, application/json'));
			curl_setopt($ch, CURLOPT_POST, 7);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $doc_data);
			$output= curl_exec($ch);
			curl_close($ch);
			//unlink()
			echo $output;
		}

		function read_and_put_doc() {
			$docId = $_REQUEST["docId"];
			$doc_data = file_get_contents('php://input');
			$this->put_doc($docId, $doc_data);
		}

		function delete_doc($docId, $rev) {
			$ch = curl_init();

			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch,CURLOPT_URL,$this->couchUrl.$docId."?rev=".$rev);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json',
			'Accept: application/javascript, application/json'));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
			$output=curl_exec($ch);
			curl_close($ch);
			//fclose($docdata_file);
			//unlink($docdata_filename);
			echo $output;
		}

		function go() {
			$action = $_REQUEST["do"];

			switch($action) {
				case "getall": $this->get_all_docs(); break;
				case "getdoc": $this->get_doc($_REQUEST["docId"]); break;
				case "savedoc": $this->read_and_put_doc(); break;
				case "adddoc": $this->read_and_add_doc(); break;
				case "deldoc": $this->delete_doc($_REQUEST["docId"], $_REQUEST["rev"]); break;
			}
		}
	}

	$proxy = new CouchProxy($couchUrl);

	$proxy->go();

?>
