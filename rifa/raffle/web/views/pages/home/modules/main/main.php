<?php 

$totalSales = 0;
$url = "sales?linkTo=id_raffle_sale&equalTo=".$raffle->id_raffle."&select=number_sale";
$sales = CurlController::request($url,$method,$fields);

if($sales->status == 200){

    $totalSales = $sales->total;
    $sales = $sales->results;

}else{

    $sales = array();
    
} 

?>

<!--=================================
MAIN
==================================-->

<div class="container-fluid p-0 position-relative" id="main">

    <figure class="position-absolute colorImage" style="top:0;left:0;width:100%">
        <img src="/views/assets/img/contest-bg.png" class="img-fluid w-100">
    </figure>

    <?php 

        include "views/modules/countdown/countdown.php";

    ?>

    <?php if ($raffle->end_date_raffle > date("Y-m-d H:m:s")): ?>
  
        <div class="container mt-3 pb-5 mt-lg-0 px-3 px-lg-5 position-relative">

            <div class="row">

                <div class="offset-lg-1 col-lg-10">

                    <div class="row">
                      
                        <div class="col-12 col-lg-6 mt-5 mt-lg-0">
                            <h5 class="text-uppercase josefin-sans-700 t1">Necesita saber acerca de</h5> 
                            <h1 class="text-uppercase josefin-sans-700 display-4">Cómo Jugar</h1> 
                            <p class="h5 josefin-sans-700">¡Sigue estos 3 sencillos pasos!</p> 
                        </div>

                        <div class="col-12 col-lg-2 mb-2 mb-lg-0">
                           <div class="card colorImage" style="background:url('/views/assets/img/card-bg-1.jpg'); background-size: cover; background-position: center center;">
                              <div class="card-body text-center">
                                <figure class="rounded-circle c1 mx-auto">
                                    <img src="/views/assets/img/1.png" class="img-fluid">
                                </figure>
                                <p class="h5 josefin-sans-700">1.ELIGE<br><small>Tu número ganador</small></p>
                              </div>
                            </div> 
                        </div>

                        <div class="col-12 col-lg-2 mb-2 mb-lg-0">
                           <div class="card colorImage" style="background:url('/views/assets/img/card-bg-2.jpg'); background-size: cover; background-position: center center;">
                              <div class="card-body text-center">
                                <figure class="rounded-circle c1 mx-auto">
                                    <img src="/views/assets/img/2.png" class="img-fluid">
                                </figure>
                                <p class="h5 josefin-sans-700">2.COMPRA<br><small>Completando los datos</small></p>
                              </div>
                            </div> 
                        </div>

                        <div class="col-12 col-lg-2 mb-2 mb-lg-0">
                           <div class="card colorImage" style="background:url('/views/assets/img/card-bg-3.jpg'); background-size: cover; background-position: center center;">
                              <div class="card-body text-center">
                                <figure class="rounded-circle c1 mx-auto">
                                    <img src="/views/assets/img/3.png" class="img-fluid">
                                </figure>
                                <p class="h5 josefin-sans-700">3.GANA<br><small>Ya casi estás ahí</small></p>
                              </div>
                            </div> 
                        </div>

                    </div>

                    <h1 class="josefin-sans-700 text-uppercase text-center  mt-5 pt-lg-5">ELIGE TU(s) NÚMERO(s) | $<?php echo number_format(urldecode($raffle->price_raffle),2) ?> USD C/U</h1>

                    <div class="text-center position-relative" style="z-index:1">
                        
                        <div class="d-flex flex-wrap w-100 justify-content-center bg p-2 p-lg-3 py-lg-5 rounded">

                            <?php 

                            $sold = 0;
                            $range = explode(",",urldecode($raffle->numbers_raffle)); 
                            $diff = $range[1] - $range[0];

                            ?>

                            <?php for ($i = $range[0]; $i <= $range[1]; $i++): ?>

                                <?php if (strlen($range[1]) == 2 && strlen($i) == 1): $i = "0".$i ?><?php endif ?>

                                <?php if (strlen($range[1]) == 3 && strlen($i) == 1): $i = "00".$i ?><?php endif ?>
                                <?php if (strlen($range[1]) == 3 && strlen($i) == 2): $i = "0".$i ?><?php endif ?>

                                <?php if (strlen($range[1]) == 4 && strlen($i) == 1): $i = "000".$i ?><?php endif ?>
                                <?php if (strlen($range[1]) == 4 && strlen($i) == 2): $i = "00".$i ?><?php endif ?>
                                <?php if (strlen($range[1]) == 4 && strlen($i) == 3): $i = "0".$i ?><?php endif ?>

                                <!--=====================================
                                Marcar los números comprados
                                =======================================-->

                                <?php if (!empty($sales)): ?>

                                    <?php foreach ($sales as $key => $value): ?>

                                        <?php if ($value->number_sale == $i): $sold = $value->number_sale ?>

                                            <div class="h3 text-center numbers sold rounded-circle m-1" number="<?php echo $i ?>" style="cursor:pointer"><span class=" p-2"><s><?php echo $i ?></s></span></div>
                                            
                                        <?php endif ?>
                                        
                                    <?php endforeach ?>
                                    
                                <?php endif ?>

                                <?php if ($i != $sold): ?>

                                    <div class="h3 text-center numbers numbersClick rounded-circle m-1" item="0" number="<?php echo $i ?>" style="cursor:pointer"><span class=" p-2"><?php echo $i ?></span></div> 
                                    
                                <?php endif ?>
       
                            <?php endfor ?>
       
                        </div>

                        <button class="my-4 btn btn-default btn-lg btn-block w-100 p-3 border rounded text-white buyNumbers b1 border-0">COMPRAR NÚMERO(s)</button>
                    </div>

                </div>

            </div>

        </div>

        <svg class="position-absolute" style="bottom:0px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="<?php if ($template == null): ?>#360254<?php else: ?><?php echo urldecode($template->color2_template) ?><?php endif ?>" fill-opacity="1" d="M0,160L120,186.7C240,213,480,267,720,256C960,245,1200,171,1320,133.3L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>

    <?php endif ?>

</div>