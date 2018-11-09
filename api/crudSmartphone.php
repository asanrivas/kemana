<?php
	require_once('connection.php');

	if($_GET['operation']=='delete') {
		$sqlOperation = "DELETE FROM smartphone WHERE s_id = '".$_GET['deleteId']."'";
		executeQuery($db, $sqlOperation);
	}
	else if($_GET['operation']=='addupdate') {	
		$sqlOperation = "SELECT 1 FROM smartphone WHERE s_id = '".$_GET['s_id']."'";
		$result = executeQuery($db, $sqlOperation);
		if($row = $result->fetch_assoc()) {		
			$sqlOperation = "
				UPDATE smartphone
				SET
					s_number = '".$_GET['s_number']."',
					d_id = '".$_GET['d_id']."'
				WHERE s_id = '".$_GET['s_id']."'
			";
			$result = executeQuery($db, $sqlOperation);
		}
		else {
			$sqlOperation = "
				INSERT INTO smartphone (s_number, d_id) VALUES (
					'".$_GET['s_number']."',
					'".$_GET['d_id']."'
				)
			";
			executeQuery($db, $sqlOperation);
		}
	}
	else if($_GET['operation']=='activate') {
		$sqlOperation = "
			UPDATE smartphone
			SET s_activated = '1'
			WHERE s_id = '".$_GET['s_id']."'
		";
		$result = executeQuery($db, $sqlOperation);
	}
	
	//==================================================== get latest
	$sql = "
		SELECT
			smartphone.s_id,
			smartphone.s_number,
			smartphone.s_activated,
			smartphone.s_uuid,
			driver.d_id,
			driver.d_nric,
			driver.d_name
		FROM
			smartphone,
			driver
		WHERE
			smartphone.d_id = driver.d_id
		ORDER BY s_id DESC
	";
	$result = executeQuery($db, $sql);
	$smartphone = [];
	while($row = $result->fetch_assoc()) {
		array_push($smartphone, $row);
	}

	echo json_encode([
		'status' => 'ok',
		'smartphone' => $smartphone,
		'sql' => $sql,
		'sqlOperation' => $sqlOperation
	]);
?>
