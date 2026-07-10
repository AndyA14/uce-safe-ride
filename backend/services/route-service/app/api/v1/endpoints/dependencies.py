from fastapi import Depends
from app.core.security import get_current_principal

def get_current_user(principal: dict = Depends(get_current_principal)):
    return principal