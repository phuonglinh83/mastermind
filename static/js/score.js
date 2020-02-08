function loadScore() {
    $.get('/scores', function(data, status) {
    console.log(data)
        var scores = JSON.parse(data);
        $("#scores").html(`<tr>
            <th>User name</th>
            <th>Wins</th>
            <th>Loses</th>
         </tr>`);
//        alert("Data: " + data + "\nStatus: " + status);
        scores.forEach(function(score) {
        const rowToAppend = `
            <tr>
               <td> ${score.username} </td>
               <td> ${score.wins} </td>
               <td> ${score.looses} </td>
            </tr>
        `;
            $("#scores").append(rowToAppend);
        });
    });
}
//after loading html, call  loadScore()
$(document).ready(function(){
  loadScore();
});