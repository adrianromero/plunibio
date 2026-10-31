districts = ["Harbour", "Gardens", "Observatory"]


def district_label(index: int) -> str:
    return districts[index] if index < len(districts) else "Unknown"


print(district_label(1))
