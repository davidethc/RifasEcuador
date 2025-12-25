<?php 

$status = "";

if(isset($_GET["ref"])){

	/*=============================================
	Traer info de la orden y del sorteo
	=============================================*/

	$url = "relations?rel=orders,clients,raffles&type=order,client,raffle&linkTo=ref_order&equalTo=".$_GET["ref"];
	$method = "GET";
	$fields = array();

	$order = CurlController::request($url,$method,$fields);

	if($order->status == 200){

		$order = $order->results[0];
		// echo '<pre>$order '; print_r($order); echo '</pre>';

		// return;

		if($order->status_order == "PENDING"){

			/*=============================================
			Validar el pago con PayPal
			=============================================*/

			if($order->method_order == "paypal"){

				$url = "v2/checkout/orders/".$order->id_pay_order;
				$paypal = CurlController::paypal($url,$method,$fields);
				
				
				if($paypal->status == "APPROVED"){

					$status = "PAID";

				}

			}

			/*=============================================
			Validar el pago con D-LOCAL
			=============================================*/

			if($order->method_order == "dlocal"){

				$url = "v1/payments/".$order->id_pay_order;
				$dlocal = CurlController::dlocal($url,$method,$fields);
				
				if($dlocal->status == "PAID"){

					$status = "PAID";
				}

			}

			/*=============================================
			Actualizar la orden y las ventas
			=============================================*/

			if($status == "PAID"){

				if($order->status_order == "PENDING"){

					/*=============================================
					Actualizar orden en base de datos
					=============================================*/ 

					$url = "orders?id=".$order->id_order."&nameId=id_order&token=no&except=id_order";
					$method = "PUT";
					$fields = array(
						"status_order" => $status
					);

					$fields = http_build_query($fields);

					$orderUpdate = CurlController::request($url,$method,$fields);

					if($orderUpdate->status == 200){

						/*=============================================
						Actualizar ventas en base de datos
						=============================================*/ 

						$url = "sales?linkTo=id_order_sale&equalTo=".$order->id_order;
						$method = "GET";
						$fields = array();

						$getSales = CurlController::request($url,$method,$fields);

						if($getSales->status == 200){

							$totalSales = 0;

							foreach ($getSales->results as $key => $value) {
								
								$url = "sales?id=".$value->id_sale."&nameId=id_sale&token=no&except=id_sale";
								$method = "PUT";
								$fields = array(
									"status_sale" => $status
								);

								$fields = http_build_query($fields);

								$salesUpdate = CurlController::request($url,$method,$fields);

								if($salesUpdate->status == 200){

									$totalSales++;

									if($totalSales == count($getSales->results)){

										/*=============================================
							            Enviar correo electrónico
							            =============================================*/

							            $subject = "[RifaManía] Confirmación de compra # ".$order->ref_order;
							            $email = $order->email_client;
							            $title = "[RifaManía] Pedido # ".$order->ref_order;
							            $message = "<h4>¡Gracias por tu compra!</h4><h5>Estos son tus números elegidos: <h1><strong>".$order->numbers_order."</strong></h1><br><strong>¡ATENCIÓN!</strong><br><br> A continuación haga clic en el siguiente botón para que ingrese al grupo de WhatsApp del Sorteo y esté informado de los resultados</h5><br><br>";
							             $link = $order->group_ws_raffle;

							            $sendEmail = TemplateController::sendEmail($subject, $email, $title, $message, $link); 

							            if($sendEmail == "ok"){

							            	echo '<div class="col-12 mx-1 mb-3 text-center alert alert-success">Su pago ha sido acreditado, revisa tu correo electrónico</div>';
							            }else{

							            	echo '<div class="col-12 mx-1 mb-3 text-center alert alert-warning">Su pago ha sido acreditado, pero tuvimos problemas al enviar la notificación del correo electrónico</div>';
							            }
									}
								}

							}

						}

					}

				}
			
			}else{

				$status = "PENDING";

			}

		}else{

			$status = "PAID";
		}

		include "modules/hero/hero.php";
		include "modules/main/main.php";

	}else{

		echo "<script>
			window.location = '/';
		</script>";

		return;

	}

}else{

	echo "<script>
		window.location = '/';
	</script>";

	return;
}


 ?>