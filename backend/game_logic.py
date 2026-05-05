import numpy as np
from scipy.optimize import linprog
import random

def generate_world_2d(rows: int, cols: int) -> list:
    """
    Create a 2D world matrix of size rows x cols.
    Randomly choose the type of each place (Hard, Neutral, Easy).
    """
    types = ["Hard", "Neutral", "Easy"]
    world = []
    for _ in range(rows):
        row = []
        for _ in range(cols):
            row.append(random.choice(types))
        world.append(row)
    return world

def apply_proximity_bonus_2d(hider_row: int, hider_col: int, seeker_row: int, seeker_col: int, base_score: float) -> float:
    """
    Calculate distance in 2D space using Manhattan distance.
    If distance == 1 cell: hider_score * 0.5
    If distance == 2 cells: hider_score * 0.75
    Otherwise: hider_score * 1
    """
    distance = abs(hider_row - seeker_row) + abs(hider_col - seeker_col)
    if distance == 1:
        return base_score * 0.5
    elif distance == 2:
        return base_score * 0.75
    else:
        return base_score * 1.0

def calculate_payoff_matrix_2d(world_matrix: list) -> np.ndarray:
    """
    Map the 2D coordinates to a 1D payoff matrix (zero-sum, Seeker vs Hider).
    Rows (Seeker), Cols (Hider).
    """
    rows = len(world_matrix)
    cols = len(world_matrix[0])
    num_places = rows * cols
    payoff_matrix = np.zeros((num_places, num_places))
    
    for s_idx in range(num_places):
        s_r = s_idx // cols
        s_c = s_idx % cols
        
        for h_idx in range(num_places):
            h_r = h_idx // cols
            h_c = h_idx % cols
            
            if s_idx == h_idx:
                # Seeker finds Hider
                place_type = world_matrix[s_r][s_c]
                if place_type == "Hard":
                    payoff_matrix[s_idx, h_idx] = 10
                elif place_type == "Neutral":
                    payoff_matrix[s_idx, h_idx] = 5
                else: # Easy
                    payoff_matrix[s_idx, h_idx] = 2
            else:
                # Seeker misses Hider. Hider survives and gets a base score.
                base_hider_score = 10
                hider_score = apply_proximity_bonus_2d(h_r, h_c, s_r, s_c, base_hider_score)
                # Zero-sum game: Seeker score = -Hider score
                payoff_matrix[s_idx, h_idx] = -hider_score
                
    return payoff_matrix

def solve_simplex(payoff_matrix: np.ndarray, is_seeker: bool) -> list:
    """
    Formulate the zero-sum game as an LP problem and return probabilities.
    If is_seeker is True, we solve for the row player (Seeker).
    If is_seeker is False, we solve for the column player (Hider).
    """
    num_places = payoff_matrix.shape[0]
    
    if is_seeker:
        # Seeker wants to maximize the minimum expected payoff.
        # In linprog (which minimizes): Minimize -V
        c = np.zeros(num_places + 1)
        c[0] = -1 
        
        # A_ub * x <= b_ub: V - \sum p_i * A_{ij} <= 0 for all j
        A_ub = np.zeros((num_places, num_places + 1))
        A_ub[:, 0] = 1
        A_ub[:, 1:] = -payoff_matrix.T
        b_ub = np.zeros(num_places)
        
        # A_eq * x == b_eq: \sum p_i = 1
        A_eq = np.zeros((1, num_places + 1))
        A_eq[0, 1:] = 1
        b_eq = np.array([1])
        
        bounds = [(None, None)] + [(0, 1)] * num_places
        
    else:
        # Hider wants to minimize the maximum expected payoff to the seeker.
        # Minimize V
        c = np.zeros(num_places + 1)
        c[0] = 1
        
        # A_ub * x <= b_ub: \sum q_j * A_{ij} - V <= 0 for all i
        A_ub = np.zeros((num_places, num_places + 1))
        A_ub[:, 0] = -1
        A_ub[:, 1:] = payoff_matrix
        b_ub = np.zeros(num_places)
        
        # A_eq * x == b_eq: \sum q_j = 1
        A_eq = np.zeros((1, num_places + 1))
        A_eq[0, 1:] = 1
        b_eq = np.array([1])
        
        bounds = [(None, None)] + [(0, 1)] * num_places
        
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if res.success:
        probs = res.x[1:]
        probs = np.clip(probs, 0, 1)
        if probs.sum() > 0:
            probs = probs / probs.sum()
        else:
            probs = np.ones(num_places) / num_places
        return probs.tolist()
    else:
        return (np.ones(num_places) / num_places).tolist()