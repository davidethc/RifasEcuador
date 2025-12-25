<?php 

    require_once "controllers/orders.controller.php";
    $order = new OrdersController();
    $order -> orderCreate();

?>

<!--=================================
TOP
==================================-->

<div class="container-fluid p-0" id="top">

    <div class="container p-0">

        <div class="row row-cols-2">

            <div class="col">

               <div class="h3 p-3 mt-1 mb-0">
                   <a href="/"><i class="bi bi-amd"></i> SANTI RIFA ECUADOR</a>
               </div>

            </div>

            <div class="col">

                <div class="d-flex">

                    <div class="ms-auto h5 p-3 mt-2">
                        <a href="https://wa.me/<?php echo urldecode($raffle->phone_raffle) ?>?text=duda" target="_blank"><i class="bi bi-whatsapp"></i> Atención al cliente</a>
                    </div>
                </div>
            </div>

        </div>
        
    </div>

</div>
