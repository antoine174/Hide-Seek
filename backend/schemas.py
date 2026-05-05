from pydantic import BaseModel
from typing import List

class GameConfig(BaseModel):
    rows: int = 4
    cols: int = 4
    human_role: str = "Seeker" # "Seeker" or "Hider"

class InitResponse(BaseModel):
    world: List[List[str]]
    computer_probs: List[float]

class Move(BaseModel):
    row: int 
    col: int

class PlayRequest(BaseModel):
    human_move: Move
    human_role: str
    world: List[List[str]]

class PlayResponse(BaseModel):
    computer_move: Move
    human_score_delta: float
    computer_score_delta: float
    computer_probs: List[float]

class SimulationRequest(BaseModel):
    world: List[List[str]]
    human_role: str
    rounds: int = 100

class SimulationResponse(BaseModel):
    human_score: float
    computer_score: float
    human_wins: int
    computer_wins: int
    draws: int