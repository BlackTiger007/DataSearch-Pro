mod migrations;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Migrations automatisch laden
    let migrations = migrations::load_migrations();

    // Abhängig vom Build-Typ den DB-Pfad setzen
    let db_path = if cfg!(debug_assertions) {
        "sqlite:DEV-db.sqlite"
    } else {
        "sqlite:db.sqlite"
    };

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations(db_path, migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
