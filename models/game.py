from app import db
from models import guess
import urllib.request


class Game(db.Model):
    __tablename__ = 'games'

    gameid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer)
    secret_code = db.Column(db.String())
    max_guess = db.Column(db.Integer)
    status = db.Column(db.String())


    @classmethod
    def new_game(cls, userid, max_guess = 10, num_code = 4):
        game = cls(userid, max_guess, num_code)  # create game object
        db.session.add(game)
        db.session.commit()
        return game

    def __init__(self, userid, max_guess, num_code):
        self.userid = userid
        self.max_guess = max_guess
        self.status = 'CREATED'
        contents = urllib.request.urlopen("https://www.random.org/integers/?num=" + str(num_code)
                                          + "&min=0&max=7&col=1&base=10&format=plain&rnd=new").read()
        print ("AAAAAAAAAA", contents)
        codes = [i for i in str(contents) if i.isdigit()]
        # codes = ['1', '2', '1', '2']
        #
        # for i in range(num_code):
        #     codes.append(str(i + 1))
        self.secret_code = "".join(codes)
        print("AAAAAAAAAA", codes)

    def __repr__(self):
        return '<gameid {}>'.format(self.gameid)

    def serialize(self):
        return {
            'gameid': self.gameid,
            'userid': self.userid,
            'secret_code': self.secret_code,
            'max_guess': self.max_guess,
            'status': self.status,
        }

    def game_over(self):
        return self.is_winning() or self.is_losing()

    def is_winning(self):
        return (id(self.secret_code) == id(guess.guess_value))

    def is_losing(self):
        return (self.max_guess == guess.guess_number and guess.no_of_correct != self.max_number)


