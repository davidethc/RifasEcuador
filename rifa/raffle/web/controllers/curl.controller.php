<?php

class CurlController{

  /*=============================================
  Peticiones a la API
  =============================================*/

  static public function request($url,$method,$fields){

    $curl = curl_init();

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
      CURLOPT_HTTPHEADER => array(
        'Authorization: gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4'
      ),
    ));

    $response = curl_exec($curl);

    curl_close($curl);

    $response = json_decode($response);

    return $response;

  }

  /*=============================================
  Peticiones a la API de PayPal
  =============================================*/

  static public function paypal($url, $method, $fields){

    $endpoint = "https://api-m.sandbox.paypal.com/"; //TEST
    //$endpoint = "https://api-m.paypal.com/"; //LIVE

    $clientID = "AaDNrKAqBJ5NHOpmEza6JY5rqWIFc-moMfwSMs4r6sfPMSkTd6VOM8wRJOeamombUn77l9GsDjNgU59F"; //TEST
    $secretClient = "EC2vn2qQrk6R_s6PHqSA2P1gv64T9a72SP7SlchjoIVy04QZpuQuSYEkwYV9fV6NbMEDjZSb6CXV99Fr"; //TEST

    // $clientID = ""; //LIVE
    // $secretClient = ""; //LIVE
    $basic = base64_encode($clientID.":".$secretClient);

    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $endpoint.'v1/oauth2/token',
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => 'POST',
      CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
      CURLOPT_HTTPHEADER => array(
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Basic '.$basic,
        'Cookie: cookie_check=yes'
      ),
    ));

    $response = curl_exec($curl);
    $curlError = curl_error($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    curl_close($curl);
    
    if($response === false || !empty($curlError)){
      return (object)array(
        'status' => 'ERROR',
        'message' => 'Error de conexión con PayPal: '.$curlError
      );
    }
    
    $response = json_decode($response);
    
    $token = isset($response) && isset($response->access_token) ? $response->access_token : null;

    if(!empty($token)){

      $curl = curl_init();

      curl_setopt_array($curl, array(
        CURLOPT_URL => $endpoint.$url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_POSTFIELDS => $fields,
        CURLOPT_HTTPHEADER => array(
          'Content-Type: application/json',
          'Authorization: Bearer '.$token,
          'Cookie: cookie_check=yes'
        ),
      ));

      $response = curl_exec($curl);

      curl_close($curl);
      
      $response = json_decode($response);

      return $response;

    }else{
      
      return (object)array(
        'status' => 'ERROR',
        'message' => 'No se pudo obtener el token de acceso de PayPal'
      );
      
    }

  }

  /*=============================================
  Pasarela de pagos D-LOCAL
  =============================================*/ 

  static public function dlocal($url, $method, $fields){

    $endpoint = "https://api-sbx.dlocalgo.com/"; //TEST
    // $endpoint = "https://api.dlocalgo.com/"; //LIVE

    $apiKey = ""; //TEST
    $secretKey = ""; //TEST

    // $apiKey = ""; //LIVE
    // $secretKey = ""; //TLIVE

    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $endpoint.$url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => $method,
      CURLOPT_POSTFIELDS => $fields,
      CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'Authorization: Bearer '.$apiKey.':'.$secretKey
      ),
    ));

    $response = curl_exec($curl);

    curl_close($curl);
    
    $response = json_decode($response);

    return $response;

  }


}