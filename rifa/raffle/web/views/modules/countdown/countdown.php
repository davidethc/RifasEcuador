<?php if ($raffle->win_raffle > 0 && $raffle->number_win_raffle > 0): ?>

    <div class="text-center position-relative">
        
         <div class="display-1 josefin-sans-700">¡Feliz Ganador!</div>

         <?php 

        $url = "clients?linkTo=id_client&equalTo=".$raffle->win_raffle;
        $winClient = CurlController::request($url,$method,$fields)->results[0];

        ?>

        <div class="text-center position-relative">
            
            <div class="d-flex flex-wrap w-100 justify-content-center p-2 rounded">
                 
                <div class="h1 mt-3 pe-2"><?php echo $winClient->name_client." ".$winClient->surname_client ?> con el número </div>

                <div class="h3 text-center numbers rounded-circle m-1"><span class="p-2"><?php echo $raffle->number_win_raffle ?></span></div>  
                  
            </div>

            <p class="my-2 lead">¡Gracias por participar, nos vemos en el próximo sorteo!</p>

        </div>

    </div>

<?php else: ?>

    <div class="text-center position-relative">

        <div class="countdown">

            <?php if ($raffle->end_date_raffle > date("Y-m-d H:m:s")): ?>
                <h3>Este sorteo juega en</h3>  
            <?php endif ?>
           

            <div class="timer display-1 josefin-sans-700" id="timer" time="<?php echo explode(" ",urldecode($raffle->end_date_raffle))[0] ?>">00:00:00</div>

            <?php if ($raffle->end_date_raffle <= date("Y-m-d H:m:s")): ?>

                <div class="container mb-3">
                    <div class="ratio ratio-16x9">
                      <iframe class="rounded" src="<?php echo $raffle->video_live_raffle ?>"></iframe>
                    </div>
                </div>
                            
            <?php endif ?>


            <p><?php echo urldecode($raffle->location_raffle) ?><br>Sorteo <?php echo TemplateController::formatDate(4, urldecode($raffle->end_date_raffle)) ?></p>

        </div>

    </div>

<?php endif ?>

