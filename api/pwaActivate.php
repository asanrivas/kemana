<?php
	require_once('connection.php');

	$sql = "
		UPDATE smartphone
		SET s_activated = '1'
		WHERE s_uuid = '".$_GET['uuid']."'
	";
	executeQuery($db, $sql);

	echo json_encode([
		"status" => ($db->affected_rows)==0?"ko":"ok"
	]);
?>
