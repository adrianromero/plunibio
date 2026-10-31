const districts = ["Harbour", "Gardens", "Observatory"];

export function districtLabel(index) {
    return districts[index] ?? "Unknown";
}

console.log(districtLabel(1));
