"""
INSTALLING REQUIRED PACKAGES
Run the following command to install all required packages.
python -m pip install --upgrade pip bcrypt argon2-cffi passlib cryptography
"""

from cryptography.fernet import Fernet
from passlib.hash import argon2
from passlib.hash import bcrypt_sha256

# run a few simple tests in a main function
def main():
    pepper_key: bytes = DropboxHasher.random_pepper()
    hasher: DropboxHasher = DropboxHasher(pepper_key)
    hash1: bytes = hasher.hash("password")
    hash2: bytes = hasher.hash("password")
    if hasher.check("password", hash1):
        print("YAY")
    else:
        print("BOO")
    if hasher.check("notPassword", hash2):
        print("BOO")
    else:
        print("YAY")

class DropboxHasher:
    """Hashes passwords using techniques outlined by Dropbox in 2016"""
    def __init__(self, pepper_key: bytes):
        self.pepper: Fernet = Fernet(pepper_key)

    def hash(self, pwd: str) -> bytes:
        # hash with sha256 then run 12 rounds of bcrypt
        # a random salt is generated per-password automatically
        hash: str = bcrypt_sha256.using(rounds=12).hash(pwd)
        # convert this unicode hash string into bytes before encryption
        hashb: bytes = hash.encode('utf-8')
        # encrypt this hash using the global pepper
        pep_hash: bytes = self.pepper.encrypt(hashb)
        return pep_hash

    def check(self, pwd: str, pep_hash: bytes) -> bool:
        # decrypt the hash using the global pepper
        hashb: bytes = self.pepper.decrypt(pep_hash)
        # convert this hash back into a unicode string
        hash: str = hashb.decode('utf-8')
        # check if the given password matches this hash
        return bcrypt_sha256.verify(pwd, hash)

    @staticmethod
    def random_pepper() -> bytes:
        return Fernet.generate_key()

class UpdatedHasher:
    """Upgrades the Dropbox for modern systems using Argon2"""
    def __init__(self, pepper_key: bytes):
        self.pepper = Fernet(pepper_key)

    def hash(self, pwd: str) -> bytes:
        # hash with argon2
        hash: str = argon2.using(rounds=10).hash(pwd)
        # convert this unicode hash string into bytes before encryption
        hashb: bytes = hash.encode('utf-8')
        # encrypt this hash using the global pepper
        pep_hash: bytes = self.pepper.encrypt(hashb)
        return pep_hash

    def check(self, pwd: str, pep_hash: bytes) -> bool:
        # decrypt the hash using the global pepper
        hashb: bytes = self.pepper.decrypt(pep_hash)
        # convert this hash back into a unicode string
        hash: str = hashb.decode('utf-8')
        # check if the given password matches this hash
        return argon2.verify(pwd, hash)

    @staticmethod
    def random_pepper() -> bytes:
        return Fernet.generate_key()

# run main after definitions when run directly as a script
if __name__=='__main__': main()