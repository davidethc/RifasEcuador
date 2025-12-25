/*=============================================
Actualizar la matriz del select
=============================================*/

$(document).on("change",".changeSelectType",function(){

	var matrix_column = $(this).val();
	var id_column = $(this).attr("idColumn");
	var title_column = $(this).attr("titleColumn");
	var pre_value = $(this).attr("preValue");
	
	var data = new FormData();
	data.append("matrix_column",matrix_column);
	data.append("id_column",id_column);
	data.append("pre_value",pre_value);
	data.append("token", localStorage.getItem("tokenAdmin"));

	$.ajax({
		url:"/ajax/dynamic-forms.ajax.php",
		method: "POST",
		data: data,
		contentType: false,
		cache: false,
		processData: false,
		success: function (response){

			$("#"+title_column).html(response);
			
		}

	})

})

/*=============================================
Adicionar un nuevo objeto
=============================================*/

$(document).on("click",".addObject",function(){

	var itemObjectLength = $(this).parent().find(".itemObject").length;
	
	$(this).parent().find(".itemsObject:last").append($(this).parent().find(".itemsObject .itemObject:first")[0].outerHTML.replace(/_0/g, "_"+itemObjectLength));

})


/*=============================================
Quitar un objeto
=============================================*/

function removeObject(column, position, event){

	if(position == "_0"){

		fncToastr("error", "Debe existir un item de objeto");

		return;
	}

	$(event.target).parent().parent().parent().parent().remove();

	changeItemObject(column);

}

/*=============================================
Función cuando cambia el objeto
=============================================*/

function changeItemObject(column){

	var propertyObject = $(".propertyObject."+column);
	var valueObject = $(".valueObject."+column);

	var object = '{';

	propertyObject.each((i)=>{

		object +='"'+ $(propertyObject[i]).val()+'":"'+$(valueObject[i]).val().replace(/"/g,'\\"')+'",';
		
	})

	object = object.slice(0, -1);
	object += '}';
	
	$("#"+column).val(object);
}

/*=============================================
Adicionar un nuevo item para el json
=============================================*/

$(document).on("click",".addJson",function(){

	var itemJsonLength = $(this).parent().find(".itemJson").length;
	
	$(this).parent().find(".itemsJson:last").append($(this).parent().find(".itemsJson .itemJson:first")[0].outerHTML.replace(/_0/g, "_"+itemJsonLength));

})

/*=============================================
Quitar un objeto
=============================================*/

function removeJson(column, position,event){
	console.log("position", position);

	if(position == "_0"){

		fncToastr("error", "Debe existir un item de objeto");

		return;
	}

	$(event.target).parent().parent().parent().parent().remove();

	changeItemJson(column);

}

/*=============================================
Adicionar un grupo de objetos
=============================================*/

$(document).on("click",".addJsonGroup",function(){

	var jsonGroupLength = $(this).parent().find(".jsonGroup").length;

	$(this).parent().find(".jsonGroup:last").after($(this).parent().find(".jsonGroup:first")[0].outerHTML.replace(/0_/g, jsonGroupLength+"_"));

})

/*=============================================
Remover un grupo de objetos
=============================================*/
function removeJsonGroup(column, position, event){

	if(position == "0_"){

		fncToastr("error", "Debe existir un grupo de objetos");

		return;

	}

	$(event.target).parent().parent().remove();

	changeItemJson(column);

}

/*=============================================
Función cuando cambia el Json
=============================================*/

function changeItemJson(column){

	var jsonGroup = $(".jsonGroup."+column);

	var jSon = '[';

	jsonGroup.each((f)=>{

		var propertyJson = $("."+$(jsonGroup[f]).attr("position")+"propertyJson."+column);
		var valueJson = $("."+$(jsonGroup[f]).attr("position")+"valueJson."+column);

		jSon += '{';

		propertyJson.each((i)=>{

			jSon +='"'+$(propertyJson[i]).val()+'":"'+$(valueJson[i]).val().replace(/"/g,'\\"')+'",';
			
		})

		jSon = jSon.slice(0, -1);
		jSon += '},';

	})

	jSon = jSon.slice(0, -1);
	jSon += ']';
	
	$("#"+column).val(jSon);
}

/*=============================================
Abrir ventana modal de archivos
=============================================*/

var currentInputForFile = null;

$(document).on("click",".myFiles",function(e){
	e.preventDefault();
	e.stopPropagation();

	$("#myFiles").modal("show");

	currentInputForFile = $(this).parent().find("input");
	
	// Remover manejadores anteriores para evitar duplicados
	$("#myFiles").off('shown.bs.modal');
	$("#myFiles").off('hidden.bs.modal');
	
	$("#myFiles").on('shown.bs.modal', function () {
		
		// Agregar clase especial a los copyLink dentro del modal para identificarlos
		$(".modal-body").find(".copyLink").addClass("selectFileLink");
		
		// Remover manejador anterior si existe
		$(document).off("click", ".selectFileLink");
		
		// Manejador específico para seleccionar archivo en el modal
		$(document).on("click", ".selectFileLink", function(e){
			e.preventDefault();
			e.stopPropagation();
			
			var link = $(this).attr("copy");
			
			if(link && currentInputForFile && currentInputForFile.length > 0){
				
				currentInputForFile.val(link);
				
				// Disparar evento change para notificar que el valor cambió
				currentInputForFile.trigger('change');
				
				$("#myFiles").modal("hide");
				
			}
		});
	});

	$("#myFiles").on('hidden.bs.modal', function () {
		currentInputForFile = null;
		$(".modal-body").find(".copyLink").removeClass("selectFileLink");
	});
})

/*=============================================
Cambiar la tabla de relaciones
=============================================*/

$(document).on("change",".changeRelations",function(){

	var selectRelations = $(this).parent().find(".selectRelations");

	$(selectRelations).html('');

	var table = $(this).val();
	var id_column = $(this).attr("idColumn");
	
	var data = new FormData();
	data.append("table",table);
	data.append("id_column",id_column);
	data.append("token", localStorage.getItem("tokenAdmin"));

	$.ajax({
		url:"/ajax/dynamic-forms.ajax.php",
		method: "POST",
		data: data,
		contentType: false,
		cache: false,
		processData: false,
		success: function (response){
			
			if(JSON.parse(response).length > 0){

				JSON.parse(response).forEach((e,i)=>{

					$(selectRelations).append(`

						<option value="${Object.values(e)[0]}">${Object.values(e)[0]} - ${Object.values(e)[1]}</option>

					 `)

				})

			}	
			
		}

	})

})

/*=============================================
Actualizar la matriz de ChatGPT
=============================================*/

$(document).on("change",".changeChatGPT",function(){

	fncMatPreloader("on");
	fncSweetAlert("loading", "Esperando respuesta de ChatGPT...", "");

	var matrix_prompt = $(this).val();
	var id_prompt = $(this).attr("idPrompt");
	var title_prompt = $(this).attr("titlePrompt");
	
	var data = new FormData();
	data.append("matrix_prompt",matrix_prompt);
	data.append("id_prompt",id_prompt);
	data.append("token", localStorage.getItem("tokenAdmin"));

	$.ajax({
		url:"/ajax/dynamic-forms.ajax.php",
		method: "POST",
		data: data,
		contentType: false,
		cache: false,
		processData: false,
		success: function (response){

			fncMatPreloader("off");
			fncSweetAlert("close", ".", "");

			$("#"+title_prompt).summernote('code', response);
			
		}

	})

})



