/*=============================================
Validación Bootstrap
=============================================*/
// Disable form submissions if there are invalid fields
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Get the forms we want to add validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();


/*=============================================
Función para validar email repetido
=============================================*/

function validateEmailx2(event, type){

  $(event.target).parent().addClass("was-validated");

  if(type == "email"){

    if(event.target.value != $('[name="email"]').val()){

      $(event.target).parent().children(".invalid-feedback").html("El correo electrónico no coincide");

      event.target.value = "";

      return;

    }
  }

}

/*=============================================
Función para validar formularios
=============================================*/

function validateJS(event, type){

  $(event.target).parent().addClass("was-validated");
  
  if(type == "email"){

    var pattern = /^[.a-zA-Z0-9_]+([.][.a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}$/;
    
    if(!pattern.test(event.target.value)){

      $(event.target).parent().children(".invalid-feedback").html("El correo electrónico está mal escrito");

      event.target.value = "";

      return;

    }

  }

  if(type == "text"){

    var pattern = /^[A-Za-zñÑáéíóúÁÉÍÓÚ ]{1,}$/;
    
    if(!pattern.test(event.target.value)){

      $(event.target).parent().children(".invalid-feedback").html("El campo solo debe llevar texto");

      event.target.value = "";

      return;

    }

  }

}

/*=============================================
Cambiar método de pago
=============================================*/

$(document).on("change", ".changePaid", function(){

  var mode = $(this).attr("mode");
  var cardPaid = $(".cardPaid");
  var count = 0;

  cardPaid.each((i)=>{

    $(cardPaid[i]).hide();
    count++;
  
  })

  if(count == cardPaid.length){
    console.log("cardPaid.length", cardPaid.length);
    $("#"+mode).show("");
  }
 

})

/*=============================================
InputMask para Whatsapp
=============================================*/

var phoneMask = IMask(document.getElementById('phone-mask'), {
  mask: '+{57}(000)000-00-00'
})

