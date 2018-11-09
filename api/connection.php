<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING);
$db = new mysqli('demo.ansi.com.my', 'admin', 'Xs2mysql_admin', 'fleet');
if(mysqli_connect_errno()) {
	$timestamp = date("YmdHis");
	file_put_contents("log/error.log", $timestamp . "\t\t" . 'Connection error: '. mysqli_connect_errno() . "\n", FILE_APPEND);
	echo json_encode(['status' => "Connection error"]);
	die();
}
session_start();

function executeQuery($db, $sql) {
	if(!$result = $db->query($sql)) {
		$timestamp = date("YmdHis");
		file_put_contents("log/error.log", $timestamp . "\t\t" . 'SQL Error: '.($db->error), FILE_APPEND);
		file_put_contents("log/error.log", preg_replace("/\n/", "\n\t\t\t\t\t\t\t\t", $sql) . "\n", FILE_APPEND);
		echo json_encode(['status' => "SQL Error $timestamp", "sql" => $sql]);
		die();
	}

	return $result;
}
?>
