function selectGame(num_code) {
    $.post('/new_game2',
        {num_code:num_code},
        function(data, status) {
            $(location).attr('href', '/game/' + data);
//            console.log(data);
//            var gameinfo = JSON.parse(data);
//            $('#gameid').val(gameinfo.gameid);
//            $('input[name="num_codes"]').attr("disabled", false)
//            render_game(gameinfo);
        });
}

function newGame() {
    return selectGame(game_size());
}

function playRandom() {
    var num_code = game_size();
    for (i=1; i< num_code +1; i++) {
        setInput(i, Math.floor(Math.random() * 7), num_code)
    }
}

function getHint() {
     gameid = $("#gameid").val();
     $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            code_length = gameinfo.secret_code.length
            random_hint_index = Math.floor(Math.random() * code_length);
            setInput(random_hint_index + 1, gameinfo.secret_code[random_hint_index], code_length)
            $('#get_hint').attr("disabled", true)
        });
}

function submitGuess() {
    $('input[name="num_codes"]').attr("disabled", true)
    gameid = $("#gameid").val();
    var guess_value = "";
    var num_codes = game_size();
    for (var i = 1; i < num_codes + 1; i++) {
        guess_value += $('#cell_0_' + i).html()
    }
//    code1 = $('#code1').html();
//    code2 = $('#code2').html();
//    code3 = $('#code3').html();
//    code4 = $('#code4').html();
    $.post("/guess2",
        {
            gameid: gameid,
            guess_value: guess_value
//            code1: code1,
//            code2: code2,
//            code3: code3,
//            code4: code4
        },
        function(data, status) {
            console.log(data);
            var gameinfo = JSON.parse(data);
            render_game(gameinfo, true);
        });
}

function game_size() {
//    var totalCells = $("#colortable").children('tbody').children('tr').children('td').length;
//    var totalRows = $("#colortable").children('tbody').children('tr').length;
//    return totalCells  / totalRows;
    return $("#history").children('tbody').children('tr').children('th').length - 2;
}

color_map = {
    "0": "violet",
    "1": "blue",
    "2": "red",
    "3": "green",
    "4": "orange",
    "5": "purple",
    "6": "yellow",
    "7": "teal"
}

function render_game(gameinfo) {
    // Do not redirect if we are already in result page, otherwise, we have recursive reloading
    if (!$(location).attr('href').includes("/result") && (gameinfo.status == 'WIN' || gameinfo.status == 'LOOSE')) {
        $(location).attr('href', '/result?gameid=' + gameinfo.gameid); //redirect to results page
    }

    expiredTime = new Date(gameinfo.expired).getTime();

    $("#" + gameinfo.num_codes + "_codes").attr("checked", true);

    // Disable guess button
//    $("#guess").attr("disabled", true);

    // Render color table
    $("#colortable").html("");
    for (const [code, color] of Object.entries(color_map)) {
        var color_row = "<tr>";
        for (var i = 0; i < gameinfo.num_codes; i++) {
            color_row += `<td onclick="setInput(${i+1}, ${code}, ${gameinfo.num_codes})" bgcolor=${color}> ${code} </td>`;
        }
        color_row += "</tr>";
        $("#colortable").append(color_row);
    }

    // Render input row
    color_input = "<tr>";
    for (var i = 0; i < gameinfo.num_codes; i++) {
        color_input += `<td id="code${i+1}"> </td>`;
    }
    color_input += "</tr>";
    $("#colorinput").html(color_input);


    // Render history
//    $("#history").html(
//        `<tr>
//            <th> Guess No</th>
//            <th> Code 1</th>
//            <th> Code 2</th>
//            <th> Code 3</th>
//            <th> Code 4</th>
//            <th colspan="4"> Results </th>
//
//        </tr>`);
    var header = '<tr> <th> Guess No</th>';
    for (var i = 1; i < gameinfo.num_codes + 1; i++) {
        header += `<th> Code ${i} </th>`;
    }
    header += `<th colspan="${gameinfo.num_codes}"> Results </th> </tr>`;
    $("#history").html(header);


    gameinfo.guesses.forEach(function(guess) {
//        var rowToAppend =
//            `<tr>
//                <td> ${guess.guess_number} </td>
//                <td bgcolor=${color_map[guess.guess_value[0]]}> ${guess.guess_value[0]} </td>
//                <td bgcolor=${color_map[guess.guess_value[1]]}> ${guess.guess_value[1]} </td>
//                <td bgcolor=${color_map[guess.guess_value[2]]}> ${guess.guess_value[2]} </td>
//                <td bgcolor=${color_map[guess.guess_value[3]]}> ${guess.guess_value[3]} </td>
//                `;
        var rowToAppend = `<tr> <td> ${guess.guess_number} </td>`;
        for (var i = 0; i < gameinfo.num_codes; i++) {
            rowToAppend += `<td bgcolor=${color_map[guess.guess_value[i]]}> ${guess.guess_value[i]} </td>`;
        }

        for (i = 0; i < guess.no_correct; i++) {
            rowToAppend += '<td bgcolor="black"> </td>';
        }
        for (i = 0; i < guess.no_partial_correct; i++) {
            rowToAppend += '<td bgcolor="grey"> </td>';
        }
        for (i = 0; i < gameinfo.num_codes - guess.no_correct - guess.no_partial_correct; i++) {
            rowToAppend += '<td bgcolor="white"> </td>';
        }
        rowToAppend += "</tr>";
        $("#history").append(rowToAppend);
    });

    // Create empty rows for remaining guesses
    for (var i = 0; i < gameinfo.max_guess - gameinfo.guesses.length; i++) {
        var rowToAppend = `<tr> <td> ${i + 1 + gameinfo.guesses.length} </td>`;
        for (var j = 0; j < 2 * gameinfo.num_codes; j++) {
            rowToAppend += `<td id='cell_${i}_${j+1}'> </td>`;
        }
        rowToAppend += "</tr>";
         $("#history").append(rowToAppend);
    }
}

function setInput(index, code, num_codes) {
    $("#cell_0_" + index).html(code);
    $("#cell_0_" + index).css("background-color", color_map[code]);

    $("#code" + index).html(code);
    $("#code" + index).css("background-color", color_map[code]);

    // Check if we can enable guess button
    var enabled = true;
    for (var i = 1; i < num_codes + 1; i++) {
        if ($.trim($("#cell_0_" + i).html()) == '') { // check if the cell is empty
            enabled = false;
            break;
        }
    }
    if (enabled) {
        submitGuess();
//        $("#guess").removeAttr("disabled");
    }
//    else {
//        $("#guess").attr("disabled", true);
//    }

}

$(document).ready(function(){
  gameid = $("#gameid").val();
  interval = setInterval(timer, 1000);
  $.get("/gameinfo/" + gameid,
        function(data, status) {
            var gameinfo = JSON.parse(data);
            render_game(gameinfo);
        });
});

var expiredTime = new Date("Feb 8, 2021 16:46:25").getTime();
var interval = null;
var timer = function() {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = expiredTime - now;

    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    $("#timer").html("Remaining time: " + minutes + "m " + seconds + "s ");

    // If the count down is over, write some text
    if (distance < 0) {
        clearInterval(interval);
        $("#timer").html("EXPIRED");
        gameid = $("#gameid").val();
        $.post('/timeout/' + gameid, function(data, status) {
            var gameinfo = JSON.parse(data);
            render_game(gameinfo);
        })
    }
}
