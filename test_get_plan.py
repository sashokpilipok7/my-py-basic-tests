from get_plan import get_plan


# def test_should_return_list():
#     goals = get_plan(10, 4, 30)
#     assert isinstance(goals, list)


# def test_should_return_list_of_expected_length():
#     goals = get_plan(10, 4, 30)
#     assert len(goals) == 4


def test_should_return_expected_goals_with_rounding():
    goals = get_plan(10, 4, 30)
    assert goals == [13, 16, 20, 26]


def test_should_return_expected_goals_without_rounding():
    goals = get_plan(100, 3, 100)
    assert goals == [200, 400, 800]


def test_should_return_zeros_when_current_production_is_0():
    goals = get_plan(0, 4, 50)
    assert goals == [0, 0, 0, 0]


def test_should_return_fixed_values_when_percent_is_0():
    goals = get_plan(20, 2, 0)
    assert goals == [20, 20]


def test_should_return_empty_list_when_month_is_0():
    goals = get_plan(10, 0, 30)
    assert goals == []
