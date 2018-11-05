<?php
class LoginData {
	public $user;
	public $pass;
	public $validSession;
	function __construct($user, $pass) {
		if($user != null) {
			$this->user = $user;
			$this->pass = $pass;
			$this->validSession = true;
		}
		else {
			$this->user = "";
			$this->pass = "";
			$this->validSession = false;
		}
	}
}

session_start();

$response = null;
if(isset($_SESSION["user"]) && isset($_SESSION["pass"])) {
	$response = new LoginData($_SESSION["user"], $_SESSION["pass"]);
}
else {
	$response = new LoginData(null, null);
}

if(isset($_REQUEST["logout"])) {
	session_destroy();
}

echo json_encode($response);
?>