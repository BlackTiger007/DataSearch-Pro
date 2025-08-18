// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::LevelFilter;
use sentry::ClientInitGuard;
use sentry_log::SentryLogger;

fn main() {
    // ------------------------
    // 1️⃣ Sentry initialisieren
    // ------------------------
    // DSN von GlitchTip (deine Rust-App)
    let _sentry: ClientInitGuard = sentry::init((
        "https://b67bac9e74114973b392628eb0ea00df@glitchtip.webretter.com/3",
        sentry::ClientOptions {
            release: Some("datasearch-pro@1.0.0".into()), // Version deiner App
            environment: Some(
                if cfg!(debug_assertions) {
                    "development"
                } else {
                    "production"
                }
                .into(),
            ),
            ..Default::default()
        },
    ));

    // ---------------------------------------
    // 2️⃣ Logger konfigurieren (log::error → Event)
    // ---------------------------------------
    let logger = SentryLogger::with_dest(log::logger());
    log::set_boxed_logger(Box::new(logger)).unwrap();
    log::set_max_level(LevelFilter::Error);

    // ------------------------
    // 3️⃣ Deine App starten
    // ------------------------
    datasearch_pro_lib::run();

    // Hinweis: _sentry wird beim Beenden fallen gelassen
    // → alle noch offenen Events werden gesendet
}
