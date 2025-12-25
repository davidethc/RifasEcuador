<?php 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception; 

class TemplateController{

	/*=============================================
	Traemos la Vista Principal de la plantilla
	=============================================*/

	public function index(){

		include "views/template.php";

	}

	/*=============================================
	Función para dar formato a las fechas
	=============================================*/

	static public function formatDate($type, $value){

		date_default_timezone_set("America/Bogota");
		setlocale(LC_TIME, 'es.UTF-8','esp'); //Para traer dias y meses en español

		if($type == 1){

			return strftime("%d de %B, %Y", strtotime($value));
		}

		if($type == 2){

			return strftime("%b %Y", strtotime($value));

		}

		if($type == 3){

			return strftime("%d - %m - %Y", strtotime($value));

		}

		if($type == 4){

			if(strftime("%H", strtotime($value)) < 13){

				$abr = "AM";
			
			}else{

				$abr = "PM";
			}

			return strftime("%A %d de %B %Y a las %I ".$abr, strtotime($value));

		}

		if($type == 5){

			return strftime("%D", strtotime($value));

		}

		if($type == 6){

			// Formato simple en español: "31 de diciembre de 2025 a las 3 PM"
			$meses = array(
				1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
				5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
				9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'
			);

			$dias = array(
				'Sunday' => 'domingo', 'Monday' => 'lunes', 'Tuesday' => 'martes',
				'Wednesday' => 'miércoles', 'Thursday' => 'jueves', 
				'Friday' => 'viernes', 'Saturday' => 'sábado'
			);

			$timestamp = strtotime($value);
			$dia_semana = $dias[date('l', $timestamp)];
			$dia = date('d', $timestamp);
			$mes = $meses[(int)date('m', $timestamp)];
			$anio = date('Y', $timestamp);
			$hora = (int)date('H', $timestamp);
			$minutos = date('i', $timestamp);
			
			// Formato de hora 12 horas
			if($hora == 0){
				$hora_12 = 12;
				$ampm = 'AM';
			}elseif($hora < 12){
				$hora_12 = $hora;
				$ampm = 'AM';
			}elseif($hora == 12){
				$hora_12 = 12;
				$ampm = 'PM';
			}else{
				$hora_12 = $hora - 12;
				$ampm = 'PM';
			}

			return ucfirst($dia_semana) . " " . $dia . " de " . $mes . " de " . $anio . " a las " . $hora_12 . ($minutos != '00' ? ':' . $minutos : '') . " " . $ampm;

		}

	}

	/*=============================================
	Función para mayúscula inicial
	=============================================*/

	static public function capitalize($value){

		$value = mb_convert_case($value, MB_CASE_TITLE, "UTF-8");
	    return $value;

	}

	/*=============================================
	Función para generar códigos numéricos aleatorios
	=============================================*/

	static public function genCodec($length){

		$codec = rand(1*$length,(10*$length)-1).Time();

		return $codec;
	}

	/*=============================================
	Función para enviar correos electrónicos
	=============================================*/

	static public function sendEmail($subject, $email, $title, $message, $link){

		date_default_timezone_set("America/Bogota");

		$mail = new PHPMailer;

		$mail->CharSet = 'utf-8';
		//$mail->Encoding = 'base64'; //Habilitar al subir el sistema a un hosting

		$mail->isMail();

		$mail->UseSendmailOptions = 0;

		$mail->setFrom("davidecondet@gmail.com","RIFASSANTIN");

		$mail->Subject = $subject;

		$mail->addAddress($email);

		$mail->msgHTML('

			<div style="width:100%; background:#eee; position:relative; font-family:sans-serif; padding-top:40px; padding-bottom: 40px;">
	
				<div style="position:relative; margin:auto; width:600px; background:white; padding:20px">
					
					<center>
						
						<h3 style="font-weight:100; color:#999">'.$title.'</h3>

						<hr style="border:1px solid #ccc; width:80%">

						'.$message.'

						<a href="'.$link.'" target="_blank" style="text-decoration: none; mrgin-top:10px">

							<div style="line-height:25px; background:#000; width:60%; padding:10px; color:white; border-radius:5px">Haz clic aquí</div>

						</a>

						<hr style="border:1px solid #ccc; width:80%">

						<h5 style="font-weight:100; color:#999">Si no solicitó el envío de este correo, haga caso omiso de este mensaje.</h5>

					</center>

				</div>

			</div>	

		 ');

		$send = $mail->Send();

		if(!$send){

			return $mail->ErrorInfo;	
		
		}else{

			return "ok";

		}

	}

}
