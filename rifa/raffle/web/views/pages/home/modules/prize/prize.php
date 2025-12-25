<?php 

// Obtener el ID del producto desde el raffle
// El objeto $raffle viene de una relación entre raffles y products
// Tiene campos de ambas tablas: id_product (de products) e id_product_raffle (de raffles)
// Ambos deberían tener el mismo valor, pero usamos id_product que viene directamente de products
$productId = isset($raffle->id_product) ? $raffle->id_product : (isset($raffle->id_product_raffle) ? $raffle->id_product_raffle : null);

// El campo correcto en la tabla galleries es ig_product_gallery (no id_product_gallery)
if($productId){
    $url = "galleries?linkTo=ig_product_gallery&equalTo=".$productId;
    $method = "GET";
    $fields = array();
    
    $galleries = CurlController::request($url,$method,$fields);
    
    if($galleries && isset($galleries->status) && $galleries->status == 200){
        $galleries = $galleries->results;
    }else{
        $galleries = array(); 
    }
}else{
    $galleries = array();
}

/*=============================================
Ticks vendidos
=============================================*/

$percent = 0;

if(!empty($sales)){

    $percent = ceil($totalSales*100/$diff);
}

?>


<!--=================================
PRIZE
==================================-->

<div class="container-fluid p-0 position-relative" id="prize">

   <h1 class="display-4 josefin-sans-700 text-uppercase text-center">CONOCE EL PREMIO</h1>

   <div class="container">

        <?php if (!empty($galleries)): ?>
                
        <!-- Carousel -->
            <div id="demo" class="carousel slide" data-bs-ride="carousel">

                <!-- Indicators/dots -->
                <div class="carousel-indicators">

                    <?php foreach ($galleries as $key => $value): ?>
                        <button type="button" data-bs-target="#demo" data-bs-slide-to="<?php echo $key ?>" <?php if ($key == 0): ?>class="active"<?php endif ?> ></button>
                    <?php endforeach ?>
                </div>

                <!-- The slideshow/carousel -->
                <div class="carousel-inner rounded">

                    <?php foreach ($galleries as $key => $value): ?>

                        <div class="carousel-item <?php if ($key == 0): ?>active<?php endif ?>">
                            <img src="<?php echo urldecode($value->img_gallery) ?>" alt="<?php echo urldecode($value->title_gallery) ?>" class="d-block" style="width:100%">
                            <div class="carousel-caption">
                                <h3><?php echo urldecode($value->title_gallery) ?></h3>
                                <p><?php echo urldecode($value->description_gallery) ?></p>
                            </div>
                        </div>
                        
                    <?php endforeach ?>

                </div>

                <!-- Left and right controls/icons -->
                <button class="carousel-control-prev" type="button" data-bs-target="#demo" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#demo" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>
            </div>

        <?php endif ?>

        <div class="row pt-5 py-lg-5">
            
            <div class="col-12 col-lg-8">
               
              
                <h5 class="text-uppercase t1">Participa ahora para tener la oportunidad de ganar</h5> 
                <h1 class="text-uppercase josefin-sans-700 display-4"><?php echo isset($raffle->name_product) ? urldecode($raffle->name_product) : (isset($raffle->title_product) ? urldecode($raffle->title_product) : 'Premio') ?></h1> 
                <p class="h5">Sorteo <?php echo TemplateController::formatDate(6, urldecode($raffle->end_date_raffle)) ?><small><span class="px-3">|</span><?php echo urldecode($raffle->location_raffle) ?></small></p> 

                <hr style="border:1px solid #fff">

                <h3>Descripción general del premio</h3>
                <p><?php echo urldecode($raffle->description_product) ?></p>
               

            </div>

            <div class="col-12 col-lg-4 py-5">
                
                <div class="card bg bg-light p-4 rounded">
                    <h3 class="mt-3">Tickets Vendidos</h3>

                    <div class="progress my-3">
                      <div class="progress-bar" style="width:<?php echo $percent ?>%"><?php echo $percent ?>%</div>
                    </div>

                     <a href="#main" class="my-4 btn btn-default btn-lg border rounded">Participa Ahora</a>
                </div>

            </div>

        </div>

    </div>
  
</div>