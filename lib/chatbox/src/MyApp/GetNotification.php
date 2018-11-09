<?php
	include_once('../../../../executeQuery.php');

	$sql = " SELECT ILCB_ROOM, ILCB_DATA, ILCB_URL FROM ilims_usr.IL_CHATBOX WHERE ILCB_USERS LIKE '%".$_USER['HSP_STAFF_PROFILE_ID']."%' ";
	$rs = executeQuery($myQuery, $sql, 'SELECT', 'NAME');
	
	$data = [];
	if($rs) {
		for($i=0; $i<count($rs); $i++) {
			$data[] = [
				"room" => $rs[$i]['ILCB_ROOM'],
				"time" => end(json_decode($rs[$i]['ILCB_DATA'],true))['Time'],
				"url" => $rs[$i]['ILCB_URL']
			];
		}
	}
	
	echo json_encode($data);
?>