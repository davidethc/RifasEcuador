$("#myVideo").on('shown.bs.modal', function () {
  $("video")[0].play();
  console.log('Abierto y autoplay');
});

$("#myVideo").on('hidden.bs.modal', function () {
  $("video")[0].pause();
  console.log('Cerrado y stop');
});