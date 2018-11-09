<?php
	require_once('connection.php');

	$sql = "
		SELECT
			vehicle.v_registration,
			lov_vehicle_type.lvt_code,
			VL.vl_location
		FROM
			vehicle,
			lov_vehicle_type,
			vehicle_location VL
				LEFT OUTER JOIN vehicle_location VL2
					ON VL.v_id = VL2.v_id AND VL.vl_time < VL2.vl_time
		WHERE
			VL2.v_id IS NULL
			AND VL.v_id = vehicle.v_id
			AND vehicle.lvt_id = lov_vehicle_type.lvt_id
			AND lov_vehicle_type.lvt_code IN (".$_GET['filterByType'].")
			AND UPPER(vehicle.v_registration) LIKE UPPER('%".$_GET['filterBySearch']."%')
	";
	$result = executeQuery($db, $sql);
	$vehicle_location = [];
	while($row = $result->fetch_assoc()) {
		array_push($vehicle_location, $row);
	}

	echo json_encode(['status' => 'ok', 'vehicle_location' => $vehicle_location, 'sql' => $sql]);
?>
