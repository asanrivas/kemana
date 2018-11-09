<?php
	require_once('connection.php');

	if($_GET['operation']=='delete') {
		$sqlOperation = "DELETE FROM driver WHERE d_id = '".$_GET['deleteId']."'";
		executeQuery($db, $sqlOperation);
	}
	else if($_GET['operation']=='addupdate') {	
		$sqlOperation = "SELECT 1 FROM driver WHERE d_id = '".$_GET['d_id']."'";
		$result = executeQuery($db, $sqlOperation);
		if($row = $result->fetch_assoc()) {		
			$sqlOperation = "
				UPDATE driver
				SET
					d_nric = '".$_GET['d_nric']."',
					d_name = '".$_GET['d_name']."',
					lg_id = '".$_GET['lg_id']."'
				WHERE d_id = '".$_GET['d_id']."'
			";
			$result = executeQuery($db, $sqlOperation);
		}
		else {
			$sqlOperation = "
				INSERT INTO driver (d_nric, d_name, lg_id) VALUES (
					'".$_GET['d_nric']."',
					'".$_GET['d_name']."',
					'".$_GET['lg_id']."'
				)
			";
			executeQuery($db, $sqlOperation);
		}
	}
	
	//==================================================== get latest
	$sql = "
		SELECT
			driver.d_id,
			driver.d_nric,
			driver.d_name,
			driver.lg_id,
			lov_gender.lg_desc
		FROM
			driver,
			lov_gender
		WHERE
			driver.lg_id = lov_gender.lg_id
		ORDER BY d_name
	";
	$result = executeQuery($db, $sql);
	$driver = [];
	while($row = $result->fetch_assoc()) {
		array_push($driver, $row);
	}

	echo json_encode([
		'status' => 'ok',
		'driver' => $driver,
		'sql' => $sql,
		'sqlOperation' => $sqlOperation
	]);
?>
