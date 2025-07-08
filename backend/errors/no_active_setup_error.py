from fastapi import HTTPException


class NoActiveSetupError(HTTPException):
    def __init__(self):
        super().__init__(status_code=404,
                         detail="No active setup has been found")
