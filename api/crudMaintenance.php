<?php
	require_once('connection.php');

	//==================================================== get latest maintenance
	$sql = "
		SELECT
			vehicle.v_id,
			vehicle.v_registration,
			lov_vehicle_type.lvt_desc,
			lov_vehicle_condition.lvc_class,
			lov_vehicle_condition.lvc_desc
		FROM
			vehicle,
			lov_vehicle_type,
			lov_vehicle_condition
		WHERE
			vehicle.lvt_id = lov_vehicle_type.lvt_id
			AND lov_vehicle_condition.lvc_id = vehicle.lvc_id
		ORDER BY
			vehicle.v_registration
	";
	$result = executeQuery($db, $sql);
	$maintenance = [];
	while($row = $result->fetch_assoc()) {
		$dummy_year = rand(2005,2018);
		$random_date = date("d/m/Y", rand(strtotime("Oct 01 2017"), strtotime("Sep 01 2018")));

		$row['dummy_year'] = $dummy_year;
		$row['dummy_mileage'] = number_format(57205 * (2018-$dummy_year));
		$row['dummy_last_service'] = $random_date;
		array_push($maintenance, $row);
	}

	echo json_encode([
		'status' => 'ok',
		'maintenance' => $maintenance,
		'sql' => $sql,
	]);
?>
