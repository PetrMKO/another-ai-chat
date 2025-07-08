from fastapi import HTTPException


class MachineNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(status_code=404,
                         detail="Machine not found")
