from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import game_logic
import schemas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/init", response_model=schemas.InitResponse)
def initialize_game(config: schemas.GameConfig):
    world = game_logic.generate_world_2d(config.rows, config.cols)
    payoff_matrix = game_logic.calculate_payoff_matrix_2d(world)
    
    is_seeker = config.human_role != "Seeker" # Computer is Seeker if Human is not Seeker
    probs = game_logic.solve_simplex(payoff_matrix, is_seeker)
    
    return schemas.InitResponse(
        world=world,
        computer_probs=probs
    )

@app.post("/api/play", response_model=schemas.PlayResponse)
def play_round(req: schemas.PlayRequest):
    world = req.world
    rows = len(world)
    cols = len(world[0]) if rows > 0 else 0
    num_places = rows * cols
    
    payoff_matrix = game_logic.calculate_payoff_matrix_2d(world)
    
    is_computer_seeker = req.human_role != "Seeker"
    probs = game_logic.solve_simplex(payoff_matrix, is_computer_seeker)
    
    import numpy as np
    comp_idx = np.random.choice(num_places, p=probs)
    comp_row = int(comp_idx // cols)
    comp_col = int(comp_idx % cols)
    
    h_move = req.human_move
    human_idx = h_move.row * cols + h_move.col
    
    s_idx = comp_idx if is_computer_seeker else human_idx
    h_idx = human_idx if is_computer_seeker else comp_idx
    
    # payoff_matrix represents the payoff for the Seeker
    seeker_score = payoff_matrix[s_idx, h_idx]
    
    if is_computer_seeker:
        comp_score_delta = seeker_score
        human_score_delta = -seeker_score
    else:
        human_score_delta = seeker_score
        comp_score_delta = -seeker_score
        
    return schemas.PlayResponse(
        computer_move=schemas.Move(row=comp_row, col=comp_col),
        human_score_delta=float(human_score_delta),
        computer_score_delta=float(comp_score_delta),
        computer_probs=probs
    )

@app.post("/api/simulate", response_model=schemas.SimulationResponse)
def simulate_game(req: schemas.SimulationRequest):
    world = req.world
    rows = len(world)
    cols = len(world[0]) if rows > 0 else 0
    num_places = rows * cols
    
    payoff_matrix = game_logic.calculate_payoff_matrix_2d(world)
    is_computer_seeker = req.human_role != "Seeker"
    
    probs = game_logic.solve_simplex(payoff_matrix, is_computer_seeker)
    
    import numpy as np
    human_score = 0.0
    comp_score = 0.0
    human_wins = 0
    comp_wins = 0
    draws = 0
    
    for _ in range(req.rounds):
        comp_idx = np.random.choice(num_places, p=probs)
        human_idx = np.random.choice(num_places)
        
        s_idx = comp_idx if is_computer_seeker else human_idx
        h_idx = human_idx if is_computer_seeker else comp_idx
        
        seeker_score = payoff_matrix[s_idx, h_idx]
        
        if is_computer_seeker:
            c_delta = seeker_score
            h_delta = -seeker_score
        else:
            h_delta = seeker_score
            c_delta = -seeker_score
            
        human_score += h_delta
        comp_score += c_delta
        
        if h_delta > c_delta:
            human_wins += 1
        elif c_delta > h_delta:
            comp_wins += 1
        else:
            draws += 1
            
    return schemas.SimulationResponse(
        human_score=float(human_score),
        computer_score=float(comp_score),
        human_wins=human_wins,
        computer_wins=comp_wins,
        draws=draws
    )