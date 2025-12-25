<?php 

class DynamicController{

	/*=============================================
	Gestión de datos dinámicos
	=============================================*/	

	public function manage(){

		if(isset($_POST["module"])){

			echo '<script>

				fncMatPreloader("on");
			    fncSweetAlert("loading", "Procesando...", "");

			</script>';

			$module = json_decode($_POST["module"]);

			/*=============================================
			Editar datos
			=============================================*/

			if(isset($_POST["idItem"])){

				/*=============================================
				Actualizar datos
				=============================================*/

				$url = $module->title_module."?id=".base64_decode($_POST["idItem"])."&nameId=id_".$module->suffix_module."&token=".$_SESSION["admin"]->token_admin."&table=admins&suffix=admin";
				$method = "PUT";
				$fields = "";
				$count = 0;

				foreach ($module->columns as $key => $value) {

					// Verificar que el campo exista en el POST
					$fieldValue = isset($_POST[$value->title_column]) ? $_POST[$value->title_column] : "";

					if($value->type_column == "password" && !empty($fieldValue)){

						$fields.= $value->title_column."=".crypt(trim($fieldValue),'$2a$07$azybxcags23425sdg23sdfhsd$')."&";

					}else if($value->type_column == "email"){

						$fields.= $value->title_column."=".trim($fieldValue)."&";

					}else{
					
						$fields.= $value->title_column."=".urlencode(trim($fieldValue))."&";

					}
					
					$count++;

					if($count == count($module->columns)){

						$fields = substr($fields,0,-1);

						$update = CurlController::request($url,$method,$fields);

						if($update && isset($update->status) && $update->status == 200){

							echo '

								<script>

									fncMatPreloader("off");
									fncFormatInputs();
								    fncSweetAlert("success","El registro ha sido actualizado con éxito", setTimeout(()=>window.location="/'.$module->url_page.'",1000));
									

								</script>

							';
							
						}else{

							echo '

								<script>

									fncMatPreloader("off");
									fncFormatInputs();
								    fncSweetAlert("error","Error al actualizar el registro. Por favor, intente nuevamente.", "");
									

								</script>

							';
							
						}
					}
				
				}


			}else{
		
				/*=============================================
				Crear datos
				=============================================*/

				$url = $module->title_module."?token=".$_SESSION["admin"]->token_admin."&table=admins&suffix=admin";
				$method = "POST";
				$fields = array();
				$count = 0;

				foreach ($module->columns as $key => $value) {

					// Verificar que el campo exista en el POST
					$fieldValue = isset($_POST[$value->title_column]) ? $_POST[$value->title_column] : "";

					// Solo agregar campos que no estén vacíos (excepto para campos específicos)
					if($value->type_column == "password"){

						if(!empty($fieldValue)){
							$fields[$value->title_column] = crypt(trim($fieldValue),'$2a$07$azybxcags23425sdg23sdfhsd$');
						}
					
					}else if($value->type_column == "email"){

						// Los emails pueden estar vacíos
						$fields[$value->title_column] = trim($fieldValue);
						
					}else if($value->type_column == "int" || $value->type_column == "double" || $value->type_column == "money"){
						
						// Para números, enviar 0 si está vacío
						$fields[$value->title_column] = !empty($fieldValue) ? trim($fieldValue) : "0";
						
					}else if($value->type_column == "file" || $value->type_column == "image" || $value->type_column == "video"){
						
						// Para archivos, imágenes y videos, enviar el link incluso si está vacío (puede ser string vacío)
						$fields[$value->title_column] = trim($fieldValue);
						
					}else{
					
						// Para otros campos, enviar el valor sin urlencode (CURL lo hará automáticamente)
						$fields[$value->title_column] = trim($fieldValue);

					}
					
					$count++;

					if($count == count($module->columns)){

						$fields["date_created_".$module->suffix_module] = date("Y-m-d");

						// Convertir array a string usando http_build_query para evitar problemas de codificación
						$fieldsString = http_build_query($fields);
						
						$save = CurlController::request($url,$method,$fieldsString);

						if($save && isset($save->status) && $save->status == 200){

							echo '

								<script>

									fncMatPreloader("off");
									fncFormatInputs();
								    fncSweetAlert("success","El registro ha sido guardado con éxito", setTimeout(()=>window.location="/'.$module->url_page.'",1000));
									

								</script>

							';
							
						}else{

							echo '

								<script>

									fncMatPreloader("off");
									fncFormatInputs();
								    fncSweetAlert("error","'.(isset($save->results) ? "Error: ".$save->results : "Error al guardar el registro. Por favor, intente nuevamente.").'", "");
									

								</script>

							';
							
						}
					}
				
				}

			}

		}

	}

}