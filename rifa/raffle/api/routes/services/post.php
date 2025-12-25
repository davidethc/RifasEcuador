<?php

require_once "models/connection.php";
require_once "controllers/post.controller.php";

if(isset($_POST)){

	/*=============================================
	Separar propiedades en un arreglo
	=============================================*/

	$columns = array();
	
	// Campos que no son columnas de la base de datos y deben ser excluidos
	$excludedFields = array("module", "idItem");
	
	foreach (array_keys($_POST) as $key => $value) {

		// Excluir campos que no son columnas de la base de datos
		if(!in_array($value, $excludedFields)){
			array_push($columns, $value);
		}
			
	}

	/*=============================================
	Validar la tabla y las columnas
	=============================================*/

	if(empty($columns)){

		$json = array(
		 	'status' => 400,
		 	'results' => "Error: No valid fields to save"
		);

		echo json_encode($json, http_response_code($json["status"]));

		return;

	}

	if(empty(Connection::getColumnsData($table, $columns))){

		$json = array(
		 	'status' => 400,
		 	'results' => "Error: Fields in the form do not match the database. Table: ".$table.", Fields: ".implode(", ", $columns)
		);

		echo json_encode($json, http_response_code($json["status"]));

		return;

	}

	$response = new PostController();

	/*=============================================
	Peticion POST para registrar usuario
	=============================================*/	

	if(isset($_GET["register"]) && $_GET["register"] == true){

		$suffix = $_GET["suffix"] ?? "user";

		$response -> postRegister($table,$_POST,$suffix);

	/*=============================================
	Peticion POST para login de usuario
	=============================================*/	

	}else if(isset($_GET["login"]) && $_GET["login"] == true){

		$suffix = $_GET["suffix"] ?? "user";

		$response -> postLogin($table,$_POST,$suffix);

	}else{


		if(isset($_GET["token"])){

			/*=============================================
			Peticion POST para usuarios no autorizados
			=============================================*/

			if($_GET["token"] == "no" && isset($_GET["except"])){

				/*=============================================
				Validar la tabla y las columnas
				=============================================*/

				$columns = array($_GET["except"]);

				if(empty(Connection::getColumnsData($table, $columns))){

					$json = array(
					 	'status' => 400,
					 	'results' => "Error: Fields in the form do not match the database"
					);

					echo json_encode($json, http_response_code($json["status"]));

					return;

				}

				/*=============================================
				Filtrar campos que no son columnas de la base de datos
				=============================================*/
				
				$excludedFields = array("module", "idItem");
				$filteredData = array();
				
				foreach ($_POST as $key => $value) {
					if(!in_array($key, $excludedFields)){
						$filteredData[$key] = $value;
					}
				}

				/*=============================================
				Solicitamos respuesta del controlador para crear datos en cualquier tabla
				=============================================*/		

				$response -> postData($table, $filteredData);

			/*=============================================
			Peticion POST para usuarios autorizados
			=============================================*/

			}else{

				$tableToken = $_GET["table"] ?? "users";
				$suffix = $_GET["suffix"] ?? "user";

				$validate = Connection::tokenValidate($_GET["token"],$tableToken,$suffix);

				/*=============================================
				Solicitamos respuesta del controlador para crear datos en cualquier tabla
				=============================================*/		

				if($validate == "ok"){
		
					$response -> postData($table,$_POST);

				}

				/*=============================================
				Error cuando el token ha expirado
				=============================================*/	

				if($validate == "expired"){

					$json = array(
					 	'status' => 303,
					 	'results' => "Error: The token has expired"
					);

					echo json_encode($json, http_response_code($json["status"]));

					return;

				}

				/*=============================================
				Error cuando el token no coincide en BD
				=============================================*/	

				if($validate == "no-auth"){

					$json = array(
					 	'status' => 400,
					 	'results' => "Error: The user is not authorized"
					);

					echo json_encode($json, http_response_code($json["status"]));

					return;

				}

			}

		/*=============================================
		Error cuando no envía token
		=============================================*/	

		}else{

			$json = array(
			 	'status' => 400,
			 	'results' => "Error: Authorization required"
			);

			echo json_encode($json, http_response_code($json["status"]));

			return;	

		}	

	}

}