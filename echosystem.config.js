// eslint-disable-next-line
module.exports = {
    apps: [{
        name: "api",                            // app name registered in pm2
        script: "./build/index.js",             // script path relative to pm2 start

        max_memory_restart: "500M",             // restart app if it exceeds the amount of specified memory.
        watch: false,                           // restart app, if a file change in the folder or sub folder
        autorestart: true,                      // if app crashes then it will automatically restart the app

        min_uptime: "2m",
        max_restarts: 10,                       // number of consecutive unstable restarts (less than 1sec interval or custom time via min_uptime)

        exp_backoff_restart_delay: 300,         // starts at 300ms, doubles each retry
    }]
};
