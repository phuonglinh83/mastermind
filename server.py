from flask import jsonify, request, make_response, render_template, redirect
from app import db, app
from models.game import Game
from models.guess import Guess
from models.user import User


@app.route("/")
def home():
    cookie_userid = request.cookies.get('userid')
    if cookie_userid:
        username = User.query.filter_by(userid=cookie_userid).first().username
        return render_template('index.html', username=username)
    else:
        return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    name = request.form['username']
    # cookie_username = request.cookies.get('username')
    user = User.query.filter_by(username=name).first()
    if not user:
        user = User.new_user(name)
    resp = make_response(render_template('index.html', username=name))
    resp.set_cookie('userid', str(user.userid))
    return resp

@app.route('/logout')
def logout():
    resp = make_response(render_template('login.html'))
    resp.set_cookie('userid', expires=0)
    return resp


@app.route('/new_game', methods=['GET'])
def new_game():
    userid = request.cookies.get('userid')
    game = Game.new_game(userid=userid)
    return redirect('/game/' + str(game.gameid))

@app.route('/game/<gameid>', methods=['GET'])
def get_game(gameid):
    game = Game.query.filter_by(gameid=gameid).first()
    guesses = Guess.query.filter_by(gameid=gameid).all()
    return render_template("game.html", gameid=game.gameid, guesses=guesses)

@app.route('/gameinfo/<gameid>', methods=['get'])
def game_info(gameid):
    game = Game.query.filter_by(gameid=gameid).first()
    guesses = Guess.query.filter_by(gameid=gameid).all()
    results = game.serialize()
    guesses_dict = []
    for guess in guesses:
        guesses_dict.append(guess.serialize())
    results['guesses'] = guesses_dict
    results['num_codes'] = len(game.secret_code)
    # results['guesses'] = [guess.serialize() for guess in guesses]
    return jsonify(results)

@app.route('/guess', methods=['POST'])
def guess():
    if request.method == 'POST':
        code1 = request.form['code1']
        code2 = request.form['code2']
        code3 = request.form['code3']
        code4 = request.form['code4']
        game_id = int(request.form['gameid'])
        guess_value = code1 + code2 + code3 + code4
        guess_number = Guess.query.filter_by(gameid=game_id).count() + 1
        print("Game to play:", game_id)
        print("Guess number to play:", guess_number)
        game = Game.query.filter_by(gameid=game_id).first()
        guess = Guess.new_guess(game.gameid, guess_number, guess_value, game.secret_code)
        if guess.no_correct == len(game.secret_code):
            return "You won!"
        if guess.guess_number == game.max_guess:
            return "You loose"
        return redirect('/game/' + str(game_id))

@app.route('/guess2', methods=['POST'])
def guess2():
    if request.method == 'POST':
        code1 = request.form['code1']
        code2 = request.form['code2']
        code3 = request.form['code3']
        code4 = request.form['code4']
        print("gameid: " + request.form['gameid'])
        game_id = int(request.form['gameid'])
        guess_value = code1 + code2 + code3 + code4
        guess_number = Guess.query.filter_by(gameid=game_id).count() + 1
        game = Game.query.filter_by(gameid=game_id).first()
        guess = Guess.new_guess(game.gameid, guess_number, guess_value, game.secret_code)
        if guess.no_correct == len(game.secret_code):
            game.status = "WIN"
        elif guess.guess_number == game.max_guess:
            game.status = "LOOSE"
        db.session.commit()
        return redirect('/gameinfo/' + str(game_id))

@app.route('/result', methods=['GET'])
def result():
    gameid = int(request.args['gameid'])
    game = Game.query.filter_by(gameid=gameid).first()
    user = User.query.filter_by(userid=game.userid).first()
    if game.status == 'WIN':
        message = "Congratulations! You won! " + "The word was " + game.secret_code + "."
        user.win()
    else:
        message = "You lost! " + "The word was " + game.secret_code + "."
        user.lose()
    return render_template('result.html', result_message=message, gameid=gameid)


@app.route("/user/<userid>")
def get_user(userid):
    user = User.query.filter_by(userid=int(userid)).first()
    return user.serialize()


@app.route("/users")
def get_all_users():
    users = User.query.all()
    users.sort(key=lambda user: -user.wins)
    return jsonify([u.serialize() for u in users])
#
# @app.route("/details")
# def get_book_details():
#     author=request.args.get('author')
#     published=request.args.get('published')
#     return "Author : {}, Published: {}".format(author,published)


if __name__ == '__main__':
    app.run()