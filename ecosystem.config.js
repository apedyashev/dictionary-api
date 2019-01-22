module.exports = {
  apps : [
      {
        name: "dictionary-api",
        script: "./api/src/bin/www.js",
        watch: true,
        env: {
            "NODE_ENV": "production"
        }
      },
      {
        name: "dictionary-queue",
        script: "./queue/app.js",
        watch: true,
        env: {
            "NODE_ENV": "production",
            "DEBUG": "email-templates"
        }
      }
  ]
}
