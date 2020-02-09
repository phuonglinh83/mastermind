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

var expiredTime = null; // Global variable for setting expired time for the timer
var interval = null; // Global variable for the timer

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

// Creates a game with a given number of codes
function createGame(num_code) {
    $.post('/new_game2',
        {num_code:num_code},
        function(data, status) {
            $(location).attr('href', '/game/' + data);
        });
}

// Creates a new game with the same number of codes as the current game
function newGame() {
    return createGame(gameSize());
}

// Plays game with a list of random codes
function playRandom() {
    var num_code = gameSize();
    for (i=1; i< num_code +1; i++) {
        setInput(i, Math.floor(Math.random() * 7), num_code)
    }
}

// Shows hint of correct code in one random column
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

// Sends a guess to server and re-render the page with the response from server
function submitGuess() {
    $('input[name="num_codes"]').attr("disabled", true)
    gameid = $("#gameid").val();
    var guess_value = "";
    var num_codes = gameSize();
    for (var i = 1; i < num_codes + 1; i++) {
        guess_value += $('#cell_0_' + i).html()
    }
    $.post("/guess2",
        {
            gameid: gameid,
            guess_value: guess_value
        },
        function(data, status) {
            console.log(data);
            var gameinfo = JSON.parse(data);
            render_game(gameinfo, true);
        });
}

// Returns number of codes in the game
function gameSize() {
    return $("#history").children('tbody').children('tr').children('th').length - 2;
}

// Renders the game page with the given gameinfo object from the server
function render_game(gameinfo) {
    // Do not redirect if we are already in result page, otherwise, we have recursive reloading
    if (!$(location).attr('href').includes("/result") && (gameinfo.status == 'WIN' || gameinfo.status == 'LOOSE')) {
        $(location).attr('href', '/result?gameid=' + gameinfo.gameid); //redirect to results page
    }

    // Set expired time for the timer with the given expired time from game info
    expiredTime = new Date(gameinfo.expired).getTime();

    // Check the right radio button corresponding to the number of codes of the game
    $("#" + gameinfo.num_codes + "_codes").attr("checked", true);

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

    // Render history table
    var header = '<tr> <th> Guess No</th>';
    for (var i = 1; i < gameinfo.num_codes + 1; i++) {
        header += `<th> Code ${i} </th>`;
    }
    header += `<th colspan="${gameinfo.num_codes}"> Results </th> </tr>`;
    $("#history").html(header);

    // Render a row for each guess
    gameinfo.guesses.forEach(function(guess) {
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

// Sets the input column defined by an index with a given code
function setInput(index, code, num_codes) {
    $("#cell_0_" + index).html(code);
    $("#cell_0_" + index).css("background-color", color_map[code]);

    // Check if we can enable guess button
    var enabled = true;
    for (var i = 1; i < num_codes + 1; i++) {
        if ($.trim($("#cell_0_" + i).html()) == '') { // check if the cell is empty
            enabled = false;
            break;
        }
    }
    if (enabled) {
        // Submit a guess if all input codes are ready
        submitGuess();
    }
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
