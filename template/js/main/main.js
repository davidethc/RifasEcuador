/*=============================================
Elimina del localStorage números previamente seleccionados
=============================================*/

localStorage.removeItem("numbersArray");

/*=============================================
Capturamos numeros a seleccionar
=============================================*/

var numbersClick = $(".numbersClick");

numbersClick.each((i)=>{

    $(numbersClick[i]).click(function(){

        /*=============================================
        Cuando se selecciona un número
        =============================================*/

        if($(this).attr("item") == "0"){

            $(this).attr("item","1");

            $(this).css({"background":"orange"});

            /*=============================================
            Cuando aún no existen números seleccionados en el LocalStorage
            =============================================*/

            if(localStorage.getItem("numbersArray") == null){

                var numbersArray = [];

                numbersArray.push($(this).attr("number"));
                
                localStorage.setItem("numbersArray",JSON.stringify(numbersArray));

            /*=============================================
            Cuando ya existen números seleccionados en el LocalStorage
            =============================================*/
            
            }else{

                var numbersArray = JSON.parse(localStorage.getItem("numbersArray"));

                numbersArray.push($(this).attr("number"));
                
                localStorage.setItem("numbersArray",JSON.stringify(numbersArray));
            }

         /*=============================================
        Cuando se deselecciona un número
        =============================================*/

        }else{

            $(this).attr("item","0");

            $(this).css({"background":"transparent"})

             /*=============================================
            Cuando necesitamos quitar número del LocalStorage
            =============================================*/

            if(localStorage.getItem("numbersArray") != null){

                var numbersArray = JSON.parse(localStorage.getItem("numbersArray"));
               
                numbersArray.splice(numbersArray.indexOf($(this).attr("number")), 1);

                localStorage.setItem("numbersArray",JSON.stringify(numbersArray));

            }
        }
    
    })

})

/*=============================================
Dirigirnos al Checkout
=============================================*/

$(document).on("click",".buyNumbers",function(){

    if(localStorage.getItem("numbersArray") == null){

        alert("No hay números seleccionados, debe seleccionar mínimo un número para concursar");
    
    }else{

        if(JSON.parse(localStorage.getItem("numbersArray")).length  == 0){

            alert("No hay números seleccionados, debe seleccionar mínimo un número para concursar");

            return;
        }

        window.location = "/checkout?numbers="+localStorage.getItem("numbersArray");
    }    

})