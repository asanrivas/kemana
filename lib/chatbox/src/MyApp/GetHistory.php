<?php
	include_once('../../../../executeQuery.php');
	
	$sql = " SELECT ILCB_ROOM, ILCB_DATA FROM ilims_usr.IL_CHATBOX WHERE ILCB_ROOM = '".$_GET['room']."' ";
	$rs = executeQuery($myQuery, $sql, 'SELECT', 'NAME');

	$data = [];	
	if($rs) {
		$data = [
			"room" => $rs[0]['ILCB_ROOM'],
			"message" => json_decode($rs[0]['ILCB_DATA'], true)
		];
	}
	
	echo json_encode($data);
?>