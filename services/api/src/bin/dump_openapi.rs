fn main() -> Result<(), Box<dyn std::error::Error>> {
    let document = serde_json::json!({
        "openapi": "3.1.0",
        "info": {
            "title": "Singularity Note API",
            "version": env!("CARGO_PKG_VERSION")
        },
        "paths": {
            "/health": {
                "get": {
                    "summary": "Service health",
                    "responses": { "200": { "description": "Healthy" } }
                }
            }
        }
    });
    println!("{}", serde_json::to_string_pretty(&document)?);
    Ok(())
}
