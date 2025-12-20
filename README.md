# wolapp

Small web app for waking your Wake-on-LAN (WoL) machines.

## Running

Building in release mode builds the frontend automatically,
assuming you have node and npm installed.

```sh
cargo run --release
```

To develop, run the following two separately:

```sh
# in one terminal
cd frontend && npm run dev
# in another
cargo run
```
