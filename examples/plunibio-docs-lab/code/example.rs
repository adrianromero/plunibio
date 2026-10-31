const DISTRICTS: [&str; 3] = ["Harbour", "Gardens", "Observatory"];

fn district_label(index: usize) -> &'static str {
    DISTRICTS.get(index).copied().unwrap_or("Unknown")
}

fn main() {
    println!("{}", district_label(1));
}
