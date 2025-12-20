use std::{env, path::Path, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=migrations");
    println!("cargo:rerun-if-changed=frontend/package.json");
    println!("cargo:rerun-if-changed=frontend/package-lock.json");
    println!("cargo:rerun-if-changed=frontend/yarn.lock");

    let profile = env::var("PROFILE").unwrap_or_default();
    if profile == "release" {
        let Ok(manifest) = env::var("CARGO_MANIFEST_DIR") else {
            println!("cargo:warning=CARGO_MANIFEST_DIR not set");
            return;
        };

        let frontend = Path::new(&manifest).join("frontend");

        if !frontend.exists() {
            println!(
                "cargo:warning=frontend directory not found at {}",
                frontend.display()
            );
            return;
        }

        match Command::new("npm").arg("i").current_dir(&frontend).status() {
            Ok(s) if s.success() => {
                println!("cargo:warning=`npm i` succeeded in {}", frontend.display());
            }
            Ok(s) => {
                println!(
                    "cargo:warning=`npm i` failed with exit code {:?} - skipping frontend build",
                    s.code()
                );
                return;
            }
            Err(e) => {
                println!(
                    "cargo:warning=failed to run `npm i` in {}: {} - skipping frontend build",
                    frontend.display(),
                    e
                );
                return;
            }
        }

        match Command::new("npm")
            .arg("run")
            .arg("build")
            .current_dir(&frontend)
            .status()
        {
            Ok(s) if s.success() => {
                println!(
                    "cargo:warning=`npm run build` succeeded in {}",
                    frontend.display()
                );
            }
            Ok(s) => {
                println!(
                    "cargo:warning=`npm run build` failed with exit code {:?}",
                    s.code()
                );
            }
            Err(e) => {
                println!(
                    "cargo:warning=failed to run `npm run build` in {}: {}",
                    frontend.display(),
                    e
                );
            }
        }
    }
}
