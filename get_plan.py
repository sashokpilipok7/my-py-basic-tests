import math


def get_plan(current_prod: int, month: int, percent: int) -> list:
    goals = []
    production = current_prod

    for _ in range(month):
        production *= 1 + percent / 100
        production = math.floor(production)
        goals.append(production)

    return goals
