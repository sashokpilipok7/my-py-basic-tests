from main import add, subtract


def test_add():
    assert add(5, 6) == 11


def test_subtract():
    assert subtract(10, 3) == 7
