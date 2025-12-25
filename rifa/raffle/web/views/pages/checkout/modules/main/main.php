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

    <div class="container position-relative" style="bottom:50px">

        <form method="POST" class="needs-validation" novalidate>

            <input type="hidden" value="<?php echo $_GET["numbers"] ?>" name="numbers">
            <input type="hidden" value="<?php echo $raffle->id_raffle ?>" name="raffle">
        
            <div class="row">
                
                <div class="offset-3 col-6">
                    
                    <div class="position-relative bg p-1 rounded">
                        
                        <p class="text-center mt-4 text-uppercase h4">COMPLETA LOS DATOS A CONTINUACIÓN</p>
                        <h1 class="text-center display-1 my-0"><i class="fas fa-angle-down"></i></h1>

                        <!--==============================================
                        NOMBRE Y APELLIDO
                        ================================================-->

                        <div class="row p-0">

                            <div class="col px-5 py-2 pt-3 input-group">

                                
                                <span class="input-group-text">
                                    <i class="bi bi-person-fill"></i>
                                </span>
                                

                                <input 
                                type="text" 
                                class="form-control rounded-end py-3" 
                                placeholder="Nombre(s)" 
                                onchange="validateJS(event,'text')"
                                name="name"
                                required>

                                <div class="invalid-feedback">Por favor llena este campo correctamente.</div>

                            </div>

                        </div>

                        <div class="row p-0">

                            <div class="col px-5 py-2 input-group">

                                
                                <span class="input-group-text">
                                    <i class="bi bi-person-fill-add"></i>
                                </span>
                                

                                <input 
                                type="text" 
                                class="form-control rounded-end py-3" 
                                placeholder="Apellido(s)" 
                                onchange="validateJS(event,'text')"
                                name="surname"
                                required>

                                <div class="invalid-feedback">Por favor llena este campo correctamente.</div>

                            </div>

                        </div>

                        <!--==============================================
                        NÚMERO WHATSAPP
                        ================================================-->

                        <div class="row">

                            <div class="col px-5 py-2 input-group">
                                
                                <span class="input-group-text">
                                    <i class="bi bi-whatsapp"></i>
                                </span>
                                
                                <input 
                                id="phone-mask"
                                type="text" 
                                class="form-control rounded-end py-3" 
                                placeholder="Número WhatsApp. Ej: +57(300)392-54-81" 
                                name="whatsapp"
                                required>

                                <div class="invalid-feedback">Por favor llena este campo correctamente.</div>

                            </div>

                        </div>  

                        <!--==============================================
                        CORREO ELECTRÓNICO
                        ================================================-->

                        <div class="row">

                            <div class="col px-5 py-2 input-group">
                                
                                <span class="input-group-text">
                                    <i class="bi bi-envelope"></i>
                                </span>
                                
                                <input 
                                type="email" 
                                class="form-control rounded-end py-3" 
                                placeholder="Correo Electrónico" 
                                onchange="validateJS(event,'email')"
                                name="email"
                                required>

                                <div class="invalid-feedback">Por favor llena este campo correctamente.</div>

                            </div>

                        </div>  

                        <!--==============================================
                        CONFIRMA CORREO ELECTRÓNICO
                        ================================================-->

                        <div class="row">

                            <div class="col px-5 py-2 pb-3 input-group">

                                <span class="input-group-text">
                                    <i class="bi bi-envelope-plus"></i>
                                </span>
                                

                                <input 
                                type="email" 
                                class="form-control rounded-end py-3" 
                                placeholder="Confirma el Correo Electrónico"
                                onchange="validateEmailx2(event,'email')"
                                name="email_2"
                                required>

                                <div class="invalid-feedback">Por favor llena este campo correctamente.</div>

                            </div>

                        </div>

                        <!--==============================================
                        DETALLES DE LA COMPRA
                        ================================================-->

                        <div class="row p-1">

                            <div class="col px-5 py-2">

                                <p class="pt-1">Detalles de la compra:</p>

                                <div class="row my-3 px-2">

                                    <div class="card border rounded w-100">

                                        <div class="d-flex justify-content-between pt-3">
                                            
                                            <div class="py-2 pl-3 josefin-sans-700 h6">Número(s) Elegido(s): </div>

                                            <div class="py-2 pl-3 josefin-sans-700 h6">
                                                <?php echo $_GET["numbers"] ?>
                                            </div>
                                            
                                        </div>

                                        <div class="d-flex justify-content-between">
                                            
                                            <div class="py-2 pl-3 josefin-sans-700 h4">Total a pagar:</div>
                                            <div class="py-2 pr-3 josefin-sans-700 h4">$<?php echo number_format(count($numbers)*$raffle->price_raffle,2) ?> USD</div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <!--==============================================
                        FORMA DE PAGO
                        ================================================-->

                        <div class="row p-1">

                            <div class="col px-5  pb-3">
                                
                                <p class="pt-1">Métodos de pago:</p>

                                <div class="row row-cols-1 row-cols-sm-2"> 

                                    <div class="col pt-2 px-2">

                                        <div class="card rounded px-4 py-1">

                                            <div class="form-check px-2 mb-3">

                                                <input type="radio" class="form-check-input mt-2 ml-1 changePaid" id="radio1" name="optradio" value="paypal" checked mode="paidPayPal">

                                                <label for="radio1" class="form-check-label float-end mt-2">

                                                    <span>
                                                        PayPal 
                                                        <img src="/views/assets/img/paypal.jpg" class="img-fluid" style="width:200px">
                                                    </span>

                                                </label>

                                            </div>

                                        </div>

                                    </div>

                                    <div class="col pt-2 px-2">

                                        <div class="card rounded px-4 py-1">

                                            <div class="form-check px-2 mb-3">

                                                <input type="radio" class="form-check-input mt-2 ml-1 changePaid" id="radio2" name="optradio" value="dlocal"  mode="paidDlocal">

                                                <label for="radio2" class="form-check-label float-end mt-2">

                                                    <span>
                                                        d-local go
                                                        <img src="/views/assets/img/d-local-go.jpg" class="img-fluid" style="width:200px">
                                                    </span>

                                                </label>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <!--==============================================
                        PAGO
                        ================================================-->

                        <div class="row">

                            <div class="col px-5 pb-3">

                                <div class="card cardPaid rounded" id="paidPayPal">

                                    <div class="card-header mb-0 pb-0">

                                        <figure class="text-center"><small>Usarás</small> <img src="/views/assets/img/paypal.png" style="width:80px;"> <br><small>Todas las transacciones son seguras y están encriptadas.</small></figure>
                                        
                                    </div>

                                    <div class="card-body pb-0">

                                        <div class="px-3">

                                            <div class="small">

                                                <div class="px-2 mb-2 text-center pb-2">
                                                    <small class="small">Luego de hacer clic en “Comprar ahora”, serás redirigido a PayPal.</small>
                                                </div>
                                            </div>
                                    
                                        </div>

                                    </div>

                                </div>
                
                                <div class="card cardPaid rounded" id="paidDlocal"  style="display: none;">

                                    <div class="card-header mb-0 pb-0">

                                        <figure class="text-center"><small>Usarás</small> <img src="/views/assets/img/d-local-go.png" style="width:80px;"> <br><small>Todas las transacciones son seguras y están encriptadas.</small></figure>
                                        
                                    </div>

                                    <div class="card-body pb-0">

                                        <div class="px-3">

                                            <div class="small">

                                                <div class="d-flex justify-content-around mb-3">
                                                    <div class="py-2 px-3 mx-2 rounded border" style="border:2px solid #000 !important"><i class="bi bi-credit-card"></i><br> Tarjeta de crédito</div>
                                                    <div class="py-2 px-3 mx-2 rounded border" style="border:2px solid #000 !important"><i class="bi bi-credit-card-2-back"></i><br> Tarjeta de débito</div>
                                                    <div class="py-2 px-3 mx-2 rounded border" style="border:2px solid #000 !important"><i class="bi bi-bank"></i><br> Transferencia bancaria</div>
                                                </div>


                                                <div class="p-2 text-center mb-2">
                                                    <small class="small">Luego de hacer clic en “Comprar ahora”, serás redirigido a Tarjetas locales, Transferencias y Efectivo para completar tu compra de forma segura.</small>
                                                </div>
                                            </div>
                                    
                                        </div>

                                    </div>

                                </div>
                

                            </div>

                        </div>  

                        <!--==============================================
                        BOTÓN
                        ================================================-->
                        <div class="row">

                            <div class="col-12 px-5 pb-3">
                       
                                <button type="submit" class="btn btn-block w-100 b1 rounded py-3 josefin-sans-700 text-uppercase border-0">Comprar ahora</button>

                            </div>

                        </div>

                    </div>

                </div>
            </div>

        </form>

    </div>

</div>