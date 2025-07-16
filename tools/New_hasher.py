import bcrypt
new_hash = bcrypt.hashpw(b"11281995", bcrypt.gensalt()).decode()
print(new_hash)
