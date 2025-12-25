<?php

/*==================================
Capturar las rutas de la URL
==================================*/ 

$routesArray = explode("/",$_SERVER["REQUEST_URI"]);

array_shift($routesArray);

foreach ($routesArray as $key => $value) {
    $routesArray[$key] = explode("?", $value)[0];
}

/*=============================================
Validar existencia de sorteo
=============================================*/

$url = "relations?rel=raffles,products&type=raffle,product&linkTo=status_raffle&equalTo=1&orderBy=id_raffle&orderMode=ASC";
$method = "GET";
$fields = array();

$raffle = CurlController::request($url,$method,$fields);

if($raffle->status == 200){

	$raffle = $raffle->results[0];

}else{

	$raffle = null;
}

/*==================================
Traer info de la plantilla
==================================*/ 

$url = "templates?linkTo=status_template&equalTo=1&orderBy=id_template&orderMode=ASC";

$template = CurlController::request($url,$method,$fields);

if($template->status == 200){

	$template = $template->results[0];

}else{

	$template = null;

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>SANTI RIFA ECUADOR</title>

    <link rel="icon" href="/views/assets/img/icon.png">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">

	<!-- Latest compiled and minified CSS -->
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/views/assets/css/coming_soon.css">

    <?php if ($template == null): ?>
    	<link rel="stylesheet" href="/views/assets/css/style.css">
    <?php else: ?>
    	<?php include "views/assets/css/style.css.php" ?>  	
    <?php endif ?>
	
    

	<!-- Latest compiled JavaScript -->
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
	<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://unpkg.com/imask@7.6.1/dist/imask.js"></script>
	
</head>
<body <?php if ($raffle == null): ?> class="coming-soon" <?php endif ?>>

<?php 

	if(!empty($raffle)){

	    include "views/modules/top/top.php";

	    if(!empty($routesArray[0])){

	        if($routesArray[0] == "checkout" || $routesArray[0] == "thanks"){

	            include "views/pages/".$routesArray[0]."/".$routesArray[0].".php";

	        }else{

	            include "views/pages/home/home.php"; 

	        }

	    }else{

	       include "views/pages/home/home.php"; 
	    
	    }

	    include "views/modules/footer/footer.php";
	    include "views/modules/modals/terms.php";
	    include "views/modules/modals/policy.php";
	    include "views/modules/modals/contact.php";

	}else{

		include "views/pages/coming-soon/coming-soon.php";

	}

?>

<script src="/views/assets/js/countdown/countdown.js"></script>
<script src="/views/assets/js/main/main.js"></script>
<script src="/views/assets/js/video/video.js"></script>

</body>
</html>