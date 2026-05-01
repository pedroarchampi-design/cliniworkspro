from collections import Counter
import math


def semantic_score(user_text: str, candidate_text: str) -> float:
    a = Counter(user_text.lower().split())
    b = Counter(candidate_text.lower().split())
    inter = set(a) & set(b)
    dot = sum(a[t] * b[t] for t in inter)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if not na or not nb:
        return 0.0
    return dot / (na * nb)
