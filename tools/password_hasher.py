import bcrypt

hash = b"$2b$12$y6rPSUeQ3.SBjNqRIrF9iuwSiksYIq04oUIbmhqdzjKtmyBydvTAq"
print(bcrypt.checkpw(b"11281995", hash))  # True if it matches
