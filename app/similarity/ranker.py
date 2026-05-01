
def rank_score(lexical: float, semantic: float) -> float:
    return round((lexical * 0.65) + (semantic * 0.35), 4)
