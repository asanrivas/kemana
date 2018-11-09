<?php
	require_once('connection.php');

	$sql = "SELECT * FROM lov_vehicleType ORDER BY lvt_order, desc";
	$result = executeQuery($db, $sql);
	$vehicleType = [];
	while($row = $result->fetch_assoc()) {
		$row['show'] = true;
		array_push($vehicleType, $row);
	}

	$sql = "SELECT * FROM lov_vehicleCondition ORDER BY lvc_order";
	$result = executeQuery($db, $sql);
	$vehicleCondition = [];
	while($row = $result->fetch_assoc()) {
		array_push($vehicleCondition, $row);
	}
	
	$sql = "SELECT * FROM lov_gender";
	$result = executeQuery($db, $sql);
	$gender = [];
	while($row = $result->fetch_assoc()) {
		array_push($gender, $row);
	}

	echo json_encode([
		'status' => 'ok',
		'vehicleType' => $vehicleType,
		'vehicleCondition' => $vehicleCondition,
		'gender' => $gender,
	]);
?>
