from get_plan import get_plan


def test_should_return_list():
    goals = get_plan(10, 4, 30)
    assert isinstance(goals, list)


def test_should_return_list_of_expected_length():
    goals = get_plan(10, 4, 30)
    assert len(goals) == 4


def test_should_return_list_with_correct_production():
    goals = get_plan(10, 4, 30)
    assert goals == [13, 16, 20, 26]
