module.exports = {
  apps: [
    {
      name: "saodem-alert-bot",
      script: "src/bot.js",
      cwd: __dirname,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
