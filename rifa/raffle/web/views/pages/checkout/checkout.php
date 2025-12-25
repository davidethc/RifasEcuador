<?php 

if(isset($_GET["numbers"]) && !empty($_GET["numbers"])){

	// Limpiar y procesar los números
	$numbersString = trim($_GET["numbers"]);
	
	// Si viene como JSON array, intentar parsearlo
	if(strpos($numbersString, '[') === 0){
		$numbersArray = json_decode($numbersString, true);
		if(is_array($numbersArray) && !empty($numbersArray)){
			$numbers = $numbersArray;
		}else{
			$numbers = explode(",", $numbersString);
		}
	}else{
		// Separar por comas
		$numbers = explode(",", $numbersString);
	}

	// Filtrar valores vacíos y validar
	$numbers = array_filter($numbers, function($n){
		return !empty(trim($n));
	});
	
	$numbers = array_values($numbers); // Reindexar el array

	if(is_array($numbers) && count($numbers) > 0){

		include "modules/hero/hero.php";
		include "modules/main/main.php";
		include "modules/privacy/privacy.php";

	}else{

		echo "<script>
			alert('No se encontraron números válidos. Por favor, selecciona al menos un número.');
			window.location = '/';
		</script>";

		return;
	}
	

}else{

	echo "<script>
		alert('No se encontraron números seleccionados. Por favor, selecciona al menos un número.');
		window.location = '/';
	</script>";

	return;
}


	
?>

<script src="/views/assets/js/forms/forms.js"></script>