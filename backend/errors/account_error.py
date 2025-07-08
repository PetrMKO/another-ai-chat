from fastapi import HTTPException


class AccountError(HTTPException):
    def __init__(self):
        super().__init__(status_code=404,
                         detail="New setup wasn't created, because the free account was not found.")
