<?php 

require_once "connection.php";

class PostModel{

	/*=============================================
	Peticion POST para crear datos de forma dinámica
	=============================================*/

	static public function postData($table, $data){

		$columns = "";
		$params = "";

		foreach ($data as $key => $value) {
			
			$columns .= $key.",";
			
			$params .= ":".$key.",";
			
		}

		$columns = substr($columns, 0, -1);
		$params = substr($params, 0, -1);


		$sql = "INSERT INTO $table ($columns) VALUES ($params)";

		$link = Connection::connect();
		$stmt = $link->prepare($sql);

		foreach ($data as $key => $value) {

			// Manejar valores NULL y vacíos
			if($value === "" || $value === null){
				$stmt->bindValue(":".$key, null, PDO::PARAM_NULL);
			}else{
				$stmt->bindValue(":".$key, $value, PDO::PARAM_STR);
			}
		
		}

		if($stmt -> execute()){

			$response = array(

				"lastId" => $link->lastInsertId(),
				"comment" => "The process was successful"
			);

			return $response;
		
		}else{

			$errorInfo = $link->errorInfo();
			// Retornar un mensaje de error más descriptivo
			return array(
				"error" => true,
				"message" => isset($errorInfo[2]) ? $errorInfo[2] : "Error desconocido al insertar datos",
				"code" => isset($errorInfo[1]) ? $errorInfo[1] : null
			);

		}


	}

}