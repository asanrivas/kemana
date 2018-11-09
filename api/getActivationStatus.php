<?php
	require_once('connection.php');

	$sql = "SELECT 1 FROM smartphone WHERE s_activated = '1' AND s_uuid = '".$_GET['uuid']."'";
	$result = executeQuery($db, $sql);
	if($row = $result->fetch_assoc()) echo json_encode(['status' => 'ok']);
	else echo json_encode(['status' => 'ko', 'sql' => $sql]);
?>
