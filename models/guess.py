from app import db


class Guess(db.Model):
    __tablename__ = 'guesses'

    gameid = db.Column(db.Integer, primary_key=True)
    guess_number = db.Column(db.Integer, primary_key=True)
    guess_value = db.Column(db.String())
    no_correct = db.Column(db.Integer)
    no_partial_correct = db.Column(db.Integer)

    @classmethod
    def new_guess(cls, gameid, guess_number, guess_value, secret_code):
        no_correct = 0
        no_partial_correct = 0
        remaining_guesss = []
        remaining_correct = []
        for index in range(len(guess_value)):
            if guess_value[index] == secret_code[index]:
                no_correct += 1
            else:
                remaining_guesss.append(guess_value[index])
                remaining_correct.append(secret_code[index])
        for code in remaining_guesss:
            if code in remaining_correct:
                no_partial_correct += 1
                remaining_correct.remove(code)
        guess = cls(gameid, guess_number, guess_value, no_correct, no_partial_correct)
        print(guess.serialize())
        db.session.add(guess)
        db.session.commit()
        return guess

    # @classmethod
    # def new_guess(cls, gameid, guess_number, guess_value, secret_code):
    #     no_correct = 0
    #     no_partial_correct = 0
    #     remaining_guesss = []
    #     remaining_correct = []
    #     for index in range(len(guess_value)):
    #         if guess_value[index] == secret_code[index]:
    #             no_correct += 1
    #         else:
    #             remaining_guesss.append(guess_value[index])
    #             remaining_correct.append()
    #     guess = cls(gameid, guess_number, guess_value, no_correct, no_partial_correct)
    #     print(guess.serialize())
    #     db.session.add(guess)
    #     db.session.commit()
    #     return guess

    def guess(self, secret_code):
        self.no_correct = 0
        self.no_partial_correct = 0
        for index1, value1 in self.guess_value:
            for index2, value2 in secret_code:
                if index1 == index2 and value1 == value2:
                    self.no_correct += 1
                elif value1 == value2:
                    self.no_partial_correct +=1
        return self.no_correct, self.no_partial_correct

    def __init__(self, gameid, guess_number, guess_value, no_correct, no_partial_correct):
        self.gameid = gameid
        self.guess_number = guess_number
        self.guess_value = guess_value
        self.no_correct = no_correct
        self.no_partial_correct = no_partial_correct

    def __repr__(self):
        return '<gameid {}>'.format(self.gameid)

    def serialize(self):
        return {
            'gameid': self.gameid,
            'guess_number': self.guess_number,
            'guess_value': self.guess_value,
            'no_correct': self.no_correct,
            'no_partial_correct': self.no_partial_correct
        }


