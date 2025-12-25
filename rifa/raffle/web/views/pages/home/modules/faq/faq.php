<?php 

$url = "faqs?select=question_faq,answer_faq";

$faqs = CurlController::request($url,$method,$fields);

if($faqs->status == 200){

    $faqs = $faqs->results;
}else{

    $faqs = array();
}

?>


<!--=================================
FAQ
==================================-->

<?php if (!empty($faqs)): ?>

<div class="container-fluid p-0 py-5 position-relative" id="faq">

    <figure class="position-absolute colorImage" style="top:0;left:0;width:100%">
        <img src="/views/assets/img/winner.jpg" class="img-fluid w-100">
    </figure>

     <h1 class="display-4 josefin-sans-700 text-uppercase text-center position-relative">PREGUNTAS FRECUENTES</h1>
  
    <div class="container">

        <div class="row">

            <div class="offset-lg-2 col-lg-8">

                <div id="accordion">

                    <?php foreach ($faqs as $key => $value): ?>

                        <div class="my-3 card bgFaq">
                            <div class="card-header">
                                <a class="btn" data-bs-toggle="collapse" href="#collapse<?php echo $key ?>">
                                    <h4 class="mt-2 josefin-sans-700"><?php echo urldecode($value->question_faq) ?></h4>
                                </a>
                            </div>
                            <div id="collapse<?php echo $key ?>" class="collapse <?php if ($key == 0): ?>show<?php endif ?>" data-bs-parent="#accordion">
                                <div class="card-body">
                                   <?php echo urldecode($value->answer_faq) ?>
                                </div>
                            </div>
                        </div>
                        
                    <?php endforeach ?>

                </div>

            </div>

        </div>

    </div>

</div>

<?php endif ?>