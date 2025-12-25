<?php 

include "modules/hero/hero.php";
include "modules/main/main.php";
if ($raffle->end_date_raffle > date("Y-m-d H:m:s")){
	include "modules/prize/prize.php";
}
include "modules/faq/faq.php";
include "modules/modal/modal.php";

?>