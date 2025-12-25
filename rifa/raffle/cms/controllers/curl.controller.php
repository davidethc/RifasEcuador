<?php 

class CurlController{

	/*=============================================
	Peticiones a la API
	=============================================*/	

	static public function request($url,$method,$fields){

		$curl = curl_init();

		// Determinar Content-Type basado en el tipo de datos
		$headers = array(
			'Authorization: gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4'
		);
		
		// Si es un string, agregar Content-Type para form-urlencoded
		if(is_string($fields)){
			$headers[] = 'Content-Type: application/x-www-form-urlencoded';
		}

		curl_setopt_array($curl, array(
			CURLOPT_URL => 'http://api.raffle.com/'.$url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => $method,
			CURLOPT_POSTFIELDS => $fields,
			CURLOPT_HTTPHEADER => $headers,
		));

		$response = curl_exec($curl);
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$curlError = curl_error($curl);

		curl_close($curl);
		
		if($response === false || !empty($curlError)){
			
			return (object)array(
				'status' => 500,
				'results' => 'Error de conexión: '.$curlError
			);
			
		}
		
		$response = json_decode($response);
		
		if(json_last_error() !== JSON_ERROR_NONE){
			
			return (object)array(
				'status' => 500,
				'results' => 'Error al procesar la respuesta de la API'
			);
			
		}
		
		return $response;

	}

	/*=============================================
	Peticiones a la API de ChatGPT
	=============================================*/	

	static public function chatGPT($content,$token,$org){

		$curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => 'https://api.openai.com/v1/chat/completions',
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_POSTFIELDS =>'{
		    "model": "gpt-4-0613",
		    "messages":[{"role": "user", "content": "'.$content.'"}]
		}',
		  CURLOPT_HTTPHEADER => array(
		    'Authorization: Bearer '.$token,
		    'OpenAI-Organization: '.$org,
		    'Content-Type: application/json'
		  ),
		));

		$response = curl_exec($curl);

		curl_close($curl);
		$response = json_decode($response);
		return $response->choices[0]->message->content;

	}


}
