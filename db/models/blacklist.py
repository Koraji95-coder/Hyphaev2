#db/models/blacklist.py
from sqlalchemy import Column, String

from db.database import Base

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"
    token = Column(String(128), primary_key=True)