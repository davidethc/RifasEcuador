<!--=================================
HERO
==================================-->

<div  class="container-fluid p-0 position-relative" id="hero">
    
    <div class="container p-0">

        <div class="row row-cols-1 row-cols-lg-2">
          
            <div class="col p-3 py-lg-5 px-lg-5 position-relative">

                 <figure class="position-absolute" style="top:0;left:0;">
                    <img src="/views/assets/img/hero-building.png" class="img-fluid">
                </figure>

                <div class="p-3 py-lg-5 px-lg-5 position-relative" style="z-index:1">

                    <h4 class="text-uppercase josefin-sans-700 t1">Ahora tienes la oportunidad</h4> 
                    <h1 class="text-uppercase josefin-sans-700 display-2"><?php echo urldecode($raffle->text_raffle) ?></h1> 
                    <p class="h5 josefin-sans-700">¿Serás tú nuestro próximo afortunado ganador?</p>

                    <div class="btn-group py-4">
                        <a href="#main" class="btn btn-default btn-lg rounded pt-3 text-uppercase b1 border-0" >Participa Ahora</a>
                        <button type="button" class="btn btn-default btn-lg mx-3 rounded pt-3 rounded-circle b2 border-0" data-bs-toggle="modal" data-bs-target="#myVideo"><i class="h3 bi bi-play-circle-fill"></i></button>
                    </div>

                </div>

            </div>

            <div class="col p-1 mb-5 py-lg-5 px-lg-5 position-relative">

               <?php 

               include "views/modules/product/product.php";

                ?>

            </div>

        </div>

    </div>

    <div>

        <?php 

           include "views/modules/svgs/svgs.php";

        ?>

    </div>
   
</div>