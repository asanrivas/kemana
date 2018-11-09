<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {
    protected $clients;
	protected $db;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
		
		date_default_timezone_set('Asia/Kuala_Lumpur');
		require dirname(__FILE__, 5).'/conf.php';
		$this->db = new \PDO("mysql:host=".DB_CONNECTION.";dbname=".DB_DATABASE, DB_USERNAME, DB_PASSWORD);
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
		$data = json_decode($msg, true);
		$time = date("d/m/Y h:i:sA");

		$newMessage = [
			"From" => $data['from'],
			"Time" => $time,
			"Quote" => $data['quote'],
			"Message" => $data['message'],
			"Uid" => "uid".md5($data['from'].$time.$data['message'])
		];

		$sql = "
			INSERT INTO ilims_usr.IL_CHATBOX (
				ILCB_ROOM,
				ILCB_DATA,
				ILCB_USERS
			) VALUES (
				'".$data['room']."',
				'[".json_encode($newMessage)."]',
				'[-1]'
			)
			ON DUPLICATE KEY UPDATE ILCB_DATA = JSON_ARRAY_APPEND(ILCB_DATA, '$', CAST('".json_encode($newMessage)."' AS JSON))
		";
		try {
			$this->executeQuery($sql);
		}
		catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
		}

		$sql = "SELECT ILCB_USERS, ILCB_URL FROM ilims_usr.IL_CHATBOX WHERE ILCB_ROOM = '".$data['room']."'";
		$rs = $this->executeQuery($sql);
		if($rs) {
			foreach($this->clients as $client) {
				$client->send(json_encode([
					"room" => $data['room'],
					"users" => $rs[0]['ILCB_USERS'],
					"url" => $rs[0]['ILCB_URL'],
					"message" => [$newMessage]
				]));
			}
		}
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
	
	public function executeQuery($sql) {
		$stmt = $this->db->prepare($sql);
		$stmt->execute();
		$rs = $stmt->fetchAll();
		
		return $rs;
	}
}