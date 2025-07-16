import bcrypt

# replace "1195" with your PIN
hashed = bcrypt.hashpw(b"1195", bcrypt.gensalt()).decode()
print(hashed)
