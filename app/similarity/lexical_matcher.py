from rapidfuzz import fuzz


def lexical_score(user_text: str, candidate_text: str) -> float:
    return fuzz.token_sort_ratio(user_text, candidate_text) / 100.0
