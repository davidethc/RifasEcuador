<?php

class OrdersController{

	/*=============================================
	Crear Orden
	=============================================*/

	public function orderCreate(){

		if(isset($_POST["name"])){

			echo '<div class="col-12 mx-1 mb-3 text-center alert alert-warning"><div class="spinner-border spinner-border-sm"></div> Procesando su pedido, será redirigido a nuestra pasarela de pagos...</div>';
			
			/*=============================================
			Traemos el sorteo
			=============================================*/

			$url = "raffles?linkTo=id_raffle,status_raffle&equalTo=".$_POST["raffle"].",1&select=id_raffle,price_raffle,group_ws_raffle,email_raffle";
			$method = "GET";
			$fields = array();

			$raffle = CurlController::request($url,$method,$fields);

			if(isset($raffle) && isset($raffle->status) && $raffle->status == 200){

				$raffle = $raffle->results[0];

			}else{

				echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: El Sorteo no se encuentra disponible, comunicarse con Soporte</div>';

				return;

			}

			/*=============================================
			Capturar el precio y el total
			=============================================*/

			$numbers = explode(",",$_POST["numbers"]);
			$total = count($numbers) * $raffle->price_raffle;

			/*=============================================
			Validar que el número no haya sido comprado
			=============================================*/

			foreach ($numbers as $key => $value) {

				$url = "sales?linkTo=number_sale,id_raffle_sale&equalTo=".$value.",".$_POST["raffle"];
				$method = "GET";
				$fields = array();

				$getNumber = CurlController::request($url,$method,$fields);

				if(isset($getNumber) && isset($getNumber->status) && $getNumber->status == 200){

					echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: "El número '.$value.' ya está adquirido por otra persona, elige otro número"</div>';

					return;

				}

			}
			
			/*=============================================
			Crear el Cliente
			=============================================*/

			$url = "clients?token=no&except=id_client";
			$method = "POST";
			$fields = array(
				"name_client" => TemplateController::capitalize(trim($_POST["name"])),
				"surname_client" => TemplateController::capitalize(trim($_POST["surname"])),
				"phone_client" => trim($_POST["whatsapp"]),
				"email_client" => trim($_POST["email"]),
				"numbers_client" => $_POST["numbers"],
				"id_raffle_client" => $raffle->id_raffle,
				"date_created_client" => date("Y-m-d")
			);

			$createClient = CurlController::request($url,$method,$fields);

			if(isset($createClient) && isset($createClient->status) && $createClient->status == 200){

				/*=============================================
				Crear la orden
				=============================================*/

				$ref = TemplateController::genCodec(11);

				$url = "orders?token=no&except=id_order";
				$method = "POST";
				$fields = array(
					"ref_order" => $ref,
					"id_raffle_order" => $raffle->id_raffle,
					"id_client_order" => $createClient->results[0]->lastId,
					"numbers_order" => $_POST["numbers"],
					"total_order" => $total,
					"method_order" => $_POST["optradio"],
					"status_order" => "PENDING",
					"date_created_order" => date("Y-m-d")
				);

				$createOrder = CurlController::request($url,$method,$fields);

				if(isset($createOrder) && isset($createOrder->status) && $createOrder->status == 200){

					/*=============================================
					Actualizamos el ID de la Orden en el Cliente
					=============================================*/

					$url = "clients?id=".$createClient->results[0]->lastId."&nameId=id_client&token=no&except=id_client";
					$method = "PUT";
					$fields = array(
						"id_order_client" => $createOrder->results[0]->lastId
					);

					$fields = http_build_query($fields);

					$updateClient = CurlController::request($url,$method,$fields);

					if(isset($updateClient) && isset($updateClient->status) && $updateClient->status == 200){

						/*=============================================
						Crear las ventas
						=============================================*/

						$totalSales = 0;

						foreach ($numbers as $key => $value) {
							
							$url = "sales?token=no&except=id_sale";
							$method = "POST";
							$fields = array(
								"id_raffle_sale" => $raffle->id_raffle,
								"id_client_sale" => $createClient->results[0]->lastId,
								"id_order_sale" => $createOrder->results[0]->lastId,
								"number_sale" => $value,
								"status_sale" => "PENDING",
								"date_created_sale" => date("Y-m-d")
							);

							$createSale = CurlController::request($url,$method,$fields);

							if(isset($createSale) && isset($createSale->status) && $createSale->status == 200){

								$totalSales++;

								if($totalSales == count($numbers)){

									$urlReturn = $_SERVER["REQUEST_SCHEME"]."://".$_SERVER["SERVER_NAME"];

									/*=============================================
									Pasarela de pagos de PayPal
									=============================================*/

									if($_POST["optradio"] == "paypal"){

										$url = 'v2/checkout/orders';
										$method = 'POST';
										$fields = '{
											          "intent": "CAPTURE",
											          "purchase_units": [
											          {
											            "reference_id": "'.$ref.'",
											            "amount": {
											              "currency_code": "USD",
											              "value": "'.number_format($total,2).'"
											            }
											          }
											          ],
											          "payment_source": {
											            "paypal": {
											              "experience_context": {
											                "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
											                "user_action": "PAY_NOW",
											                "return_url": "'.$urlReturn.'/thanks?ref='.$ref.'",
											                "cancel_url": "'.$urlReturn.'/checkout?numbers='.$_GET["numbers"].'"
											              }
											            }
											          }
											        }';

										$paypal = CurlController::paypal($url,$method,$fields);

										// Verificar si hay errores en la respuesta de PayPal
										if(isset($paypal->status) && $paypal->status == "ERROR"){
											
											echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: '.$paypal->message.'</div>';
											echo "<script>
												var processingMsg = document.querySelector('.alert-warning');
												if(processingMsg) processingMsg.style.display = 'none';
											</script>";
											
											return;
											
										}else if(!isset($paypal) || !isset($paypal->status)){
											
											echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se recibió respuesta de PayPal, intenta con otro medio de pago</div>';
											echo "<script>
												var processingMsg = document.querySelector('.alert-warning');
												if(processingMsg) processingMsg.style.display = 'none';
											</script>";
											
											return;
											
										}else if(isset($paypal->status) && $paypal->status == "PAYER_ACTION_REQUIRED"){

											$url = "orders?id=".$createOrder->results[0]->lastId."&nameId=id_order&token=no&except=id_pay_order";
												$method = "PUT";
												$fields = "id_pay_order=".$paypal->id;

											$updateOrder = CurlController::request($url,$method,$fields);

											if(isset($updateOrder) && isset($updateOrder->status) && $updateOrder->status == 200){

												/*=============================================
									            Enviar correo electrónico
									            =============================================*/

									            $subject = "[RifaManía] Recibirá un pago de $".number_format($total,2)." por ".$_POST["optradio"];
									            $email = $raffle->email_raffle;
									            $title = "[RifaManía] Pedido # ".$ref;
									            $message = "<h4>¡Recibirá un pago de $".number_format($total,2)."!</h4><h5>De ".TemplateController::capitalize(trim($_POST["name"]))." ".TemplateController::capitalize(trim($_POST["surname"])).", whatsapp: ".trim($_POST["whatsapp"]).", email: ".trim($_POST["email"]).".<br> De los número(s): <h1><strong>".$_POST["numbers"]."</strong></h1></h5><br><br>";
									             $link = $urlReturn.'/thanks?ref='.$ref;

									            TemplateController::sendEmail($subject, $email, $title, $message, $link); 

												// Mostrar mensaje de éxito antes de redirigir
												if(isset($paypal->links) && isset($paypal->links[1]) && isset($paypal->links[1]->href)){
													
													echo '<div class="col-12 mx-1 mb-3 text-center alert alert-success">SUCCESS: Diríjase a paypal a pagar</div>';
													
													echo "<script>
														// Ocultar mensaje de procesando
														var processingMsg = document.querySelector('.alert-warning');
														if(processingMsg) processingMsg.style.display = 'none';
														
														setTimeout(function(){
															window.location = '".$paypal->links[1]->href."';
														}, 2000);
													</script>";
													
												}else{
													
													echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se pudo obtener la URL de redirección de PayPal</div>';
													
													return;
													
												}

											}else{
												
												echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se pudo actualizar la orden, intenta nuevamente</div>';
												
												return;
												
											}
										}else{

											echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: PayPal presenta errores, intenta con otro medio de pago</div>';
											echo "<script>
												var processingMsg = document.querySelector('.alert-warning');
												if(processingMsg) processingMsg.style.display = 'none';
											</script>";

												return;
										}

									}

									/*=============================================
									Pasarela de pagos de D-LOCAL
									=============================================*/

									if($_POST["optradio"] == "dlocal"){

										$url = 'v1/payments/';
										$method = 'POST';
										$fields = '{
											        "amount": '.number_format($total,2).',
											        "currency" : "USD",
											        "name": "'.TemplateController::capitalize(trim($_POST["name"])).' '.TemplateController::capitalize(trim($_POST["surname"])).'",
											        "email": "'.trim($_POST["email"]).'",
											        "success_url":"'.$urlReturn.'/thanks?ref='.$ref.'",
											        "back_url":"'.$urlReturn.'/checkout?numbers='.$_GET["numbers"].'"
											    }';

										$dlocal = CurlController::dlocal($url,$method,$fields);
										
										// Verificar si hay errores en la respuesta de D-Local
										if(!isset($dlocal) || !isset($dlocal->status)){
											
											echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se recibió respuesta de D-Local, intenta con otro medio de pago</div>';
											echo "<script>
												var processingMsg = document.querySelector('.alert-warning');
												if(processingMsg) processingMsg.style.display = 'none';
											</script>";
											
											return;
											
										}else if(isset($dlocal->status) && $dlocal->status == "PENDING"){

											$url = "orders?id=".$createOrder->results[0]->lastId."&nameId=id_order&token=no&except=id_pay_order";
												$method = "PUT";
												$fields = "id_pay_order=".$dlocal->id;

											$updateOrder = CurlController::request($url,$method,$fields);

											if(isset($updateOrder) && isset($updateOrder->status) && $updateOrder->status == 200){

												/*=============================================
									            Enviar correo electrónico
									            =============================================*/

									            $subject = "[RifaManía] Recibirá un pago de $".number_format($total,2)." por ".$_POST["optradio"];
									            $email = $raffle->email_raffle;
									            $title = "[RifaManía] Pedido # ".$ref;
									            $message = "<h4>¡Recibirá un pago de $".number_format($total,2)."!</h4><h5>De ".TemplateController::capitalize(trim($_POST["name"]))." ".TemplateController::capitalize(trim($_POST["surname"])).", whatsapp: ".trim($_POST["whatsapp"]).", email: ".trim($_POST["email"]).".<br> De los número(s): <h1><strong>".$_POST["numbers"]."</strong></h1></h5><br><br>";
									            $link = $urlReturn.'/thanks?ref='.$ref;

									            TemplateController::sendEmail($subject, $email, $title, $message, $link); 

												// Mostrar mensaje de éxito antes de redirigir
												if(isset($dlocal->redirect_url)){
													
													echo '<div class="col-12 mx-1 mb-3 text-center alert alert-success">SUCCESS: Diríjase a D-Local a pagar</div>';
													
													echo "<script>
														// Ocultar mensaje de procesando
														var processingMsg = document.querySelector('.alert-warning');
														if(processingMsg) processingMsg.style.display = 'none';
														
														setTimeout(function(){
															window.location = '".$dlocal->redirect_url."';
														}, 2000);
													</script>";
													
												}else{
													
													echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se pudo obtener la URL de redirección de D-Local</div>';
													
													return;
													
												}

											}else{
												
												echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: No se pudo actualizar la orden, intenta nuevamente</div>';
												echo "<script>
													var processingMsg = document.querySelector('.alert-warning');
													if(processingMsg) processingMsg.style.display = 'none';
												</script>";
												
												return;
												
											}

										}else{

											echo '<div class="col-12 mx-1 mb-3 text-center alert alert-danger">ERROR: D-Local presenta errores, intenta con otro medio de pago</div>';
											echo "<script>
												var processingMsg = document.querySelector('.alert-warning');
												if(processingMsg) processingMsg.style.display = 'none';
											</script>";

												return;
										}
									}
				
								}

							}

						}

					}

				}

			}

		}

	}


}