<?php
	require_once('connection.php');

	$sql = "
		INSERT INTO vehicle_location (v_id, vl_location, vl_speed) VALUES (
		(
			SELECT v_id
			FROM
				smartphone,
				vehicle
			WHERE
				smartphone.s_uuid = '".$_GET['uuid']."'
				AND smartphone.d_id = vehicle.d_id
		),
		'".$_GET['location']."',
		'".$_GET['speed']."'
	)";
	executeQuery($db, $sql);
	
	if($db->affected_rows==1) echo json_encode(['status' => 'ok']);
?>
