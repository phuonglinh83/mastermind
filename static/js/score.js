function loadScore() {
    $.get('/scores', function(data, status) {
    console.log(data)
        var scores = JSON.parse(data);
        $("#scores").html(`<tr>
            <th>Rank</th>
            <th>User name</th>
            <th>Wins</th>
            <th>Loses</th>
         </tr>`);
//        alert("Data: " + data + "\nStatus: " + status);
//        scores.forEach(function(user) {
//        const rowToAppend = `
//            <tr>
//               <td> ${user.username} </td>
//               <td> ${user.username} </td>
//               <td> ${user.wins} </td>
//               <td> ${user.looses} </td>
//            </tr>
//        `;
//            $("#scores").append(rowToAppend);
//        });

        for(i = 0; i < scores.length; i++) {
        const rowToAppend = `
            <tr>
               <td> ${i + 1} </td>
               <td> ${scores[i].username} </td>
               <td> ${scores[i].wins} </td>
               <td> ${scores[i].looses} </td>
            </tr>`;
            $("#scores").append(rowToAppend);
        }
    });
}
//after loading html, call  loadScore()
$(document).ready(function(){
  loadScore();
});