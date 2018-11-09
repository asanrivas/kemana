<?php
	require_once('connection.php');
	
	if($_GET['operation']=='delete') {
		$sqlOperation = "DELETE FROM vehicle WHERE v_id = '".$_GET['deleteId']."'";
		executeQuery($db, $sqlOperation);
	}
	else if($_GET['operation']=='addupdate') {
		$sqlOperation = "SELECT 1 FROM vehicle WHERE v_id = '".$_GET['v_id']."'";
		$result = executeQuery($db, $sqlOperation);
		if($row = $result->fetch_assoc()) {			
			$sqlOperation = "
				UPDATE vehicle
				SET
					v_registration = '".$_GET['v_registration']."',
					lvc_id = '".$_GET['lvc_id']."',
					lvt_id = '".$_GET['lvt_id']."',
					d_id = '".$_GET['d_id']."'
				WHERE v_id = '".$_GET['v_id']."'
			";
			executeQuery($db, $sqlOperation);
		}
		else {
			$sqlOperation = "
				INSERT INTO vehicle (v_registration, lvc_id, lvt_id, d_id) VALUES (
					'".$_GET['v_registration']."',
					'".$_GET['lvc_id']."',
					'".$_GET['lvt_id']."',
					'".$_GET['d_id']."'
				)
			";
			executeQuery($db, $sqlOperation);
		}
	}

	//==================================================== get latest
	$sql = "
		SELECT
			vehicle.v_id,
			vehicle.v_registration,
			lov_vehicle_type.lvt_id,
			lov_vehicle_type.lvt_desc,
			driver.d_id,
			driver.d_name,
			smartphone.s_number,
			lov_vehicle_condition.lvc_id,
			lov_vehicle_condition.lvc_desc,
			lov_vehicle_condition.lvc_class
		FROM
			vehicle,
			lov_vehicle_type,
			driver,
			smartphone,
			lov_vehicle_condition
		WHERE
			vehicle.lvt_id = lov_vehicle_type.lvt_id
			AND vehicle.d_id = driver.d_id
			AND driver.d_id = smartphone.d_id
			AND vehicle.lvc_id = lov_vehicle_condition.lvc_id
		ORDER BY
			vehicle.v_registration
	";
	$result = executeQuery($db, $sql);
	$vehicle = [];
	while($row = $result->fetch_assoc()) {
		array_push($vehicle, $row);
	}

	echo json_encode([
		'status' => 'ok',
		'vehicle' => $vehicle,
		'sql' => $sql,
		'sqlOperation' => $sqlOperation
	]);
?>
