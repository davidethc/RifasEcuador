$(document).ready(function() {
   
    let targetDate = new Date($("#timer").attr("time") + "T00:00:00").getTime();

    function updateTimer() {
        let now = new Date().getTime();
        let timeLeft = targetDate - now;

        if (timeLeft > 0) {
            let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            days = ("0"+days).slice(-2);
            hours = ("0"+hours).slice(-2);
            minutes = ("0"+days).slice(-2);
            seconds = ("0"+seconds).slice(-2);

            $("#timer").html(`${days}<small>d</small> ${hours}<small>h</small> ${minutes}<small>m</small> ${seconds}<small>s</small>`);
        } else {
            $("#timer").html("¡Evento iniciado!");
            clearInterval(interval);
        }
    }

    // Actualiza el contador cada segundo
    let interval = setInterval(updateTimer, 1000);
    updateTimer();
});