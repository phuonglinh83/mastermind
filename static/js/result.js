$(document).ready(function(){
  gameid = $("#gameid").val();
  interval = setInterval(timer, 1000);
  $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            renderHistory(gameinfo);
        });
});