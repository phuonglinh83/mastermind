function submitGuess() {
    gameid = $("#gameid").val();
    code1 = $('#code1').html();
    code2 = $('#code2').html();
    code3 = $('#code3').html();
    code4 = $('#code4').html();
//    console.log(code1);
    $.post("/guess2",
        {
            gameid: gameid,
            code1: code1,
            code2: code2,
            code3: code3,
            code4: code4
        },
        function(data, status) {
            console.log(data);
            var gameinfo = JSON.parse(data);
            render_game(gameinfo, true);
        });
}

color_map = {
    "0": "pink",
    "1": "blue",
    "2": "red",
    "3": "green",
    "4": "orange",
    "5": "purple",
    "6": "yellow",
    "7": "brown"
}

function render_game(gameinfo, redirect) {
    if (redirect && (gameinfo.status == 'WIN' || gameinfo.status == 'LOOSE')) {
        $(location).attr('href', '/result?gameid=' + gameinfo.gameid);
    }

    $("#guess").attr("disabled", true);

    $("#colortable").html("");
    for (const [code, color] of Object.entries(color_map)) {
        var color_row = "<tr>";
        for (var i = 0; i < gameinfo.num_codes; i++) {
            color_row += `<td onclick="setInput(${i+1}, ${code}, ${gameinfo.num_codes})" bgcolor=${color}> ${code} </td>`;
        }
        color_row += "</tr>"
        $("#colortable").append(color_row);
    }

    color_input = "<tr>";
    for (var i = 0; i < gameinfo.num_codes; i++) {
        color_input += `<td id="code${i+1}"> </td>`;
    }
    color_input += "</tr>";
    console.log(color_input)
    $("#colorinput").html(color_input);

    $("#history").html(
        `<tr>
            <th> Guess No</th>
            <th> Code 1</th>
            <th> Code 2</th>
            <th> Code 3</th>
            <th> Code 4</th>
            <th colspan="4"> Results </th>

        </tr>`);
    gameinfo.guesses.forEach(function(guess) {
        var result = "";
        for (i = 0; i < guess.no_correct; i++) {
            result += '<td bgcolor="black"> </td>;'
        }
        for (i = 0; i < guess.no_partial_correct; i++) {
            result += '<td bgcolor="grey"> </td>';
        }
        for (i = 0; i < 4 - guess.no_correct - guess.no_partial_correct; i++) {
            result += '<td bgcolor="white"> </td>';
        }
        var rowToAppend =
            `<tr>
                <td> ${guess.guess_number} </td>
                <td bgcolor=${color_map[guess.guess_value[0]]}> ${guess.guess_value[0]} </td>
                <td bgcolor=${color_map[guess.guess_value[1]]}> ${guess.guess_value[1]} </td>
                <td bgcolor=${color_map[guess.guess_value[2]]}> ${guess.guess_value[2]} </td>
                <td bgcolor=${color_map[guess.guess_value[3]]}> ${guess.guess_value[3]} </td>
                `;
        rowToAppend += result;
        rowToAppend += "</tr>";
        $("#history").append(rowToAppend);
    });
}

function setInput(index, code, num_codes) {
    $("#code" + index).html(code);
    $("#code" + index).css("background-color", color_map[code]);
    var enabled = true;
    for (var i = 1; i < num_codes + 1; i++) {
        if ($.trim($("#code" + i).html()) == '') {
            enabled = false;
            break;
        }
    }

    if (enabled) {
        $("#guess").removeAttr("disabled");
    } else {
        $("#guess").attr("disabled", true);
    }

}

$(document).ready(function(){
  gameid = $("#gameid").val();
  $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            render_game(gameinfo, false);
        });
});