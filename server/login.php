<?php 

	include 'settings.php';
	include 'users.php';
	
	class Response {
		public $couchurl;
		public $result;
		function __construct($result, $url) {
			if($result) {
				$this->couchurl = $url; 
				$this->result = 1;
			}
			else {
				$this->couchurl = "";
				$this->result = 0;
			}
		}
	}
	
	$response = new Response(0, "");
	if(array_key_exists($_REQUEST["user"], $users)) {
		if($_REQUEST["pass"]==$users[$_REQUEST["user"]]) {
			$response = new Response(1, $couchUrl);
		}
	}
	echo json_encode($response);
?>