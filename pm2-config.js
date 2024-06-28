module.exports = {
    apps: [{
      name: 'paintcont-service-backend',
      script: 'src/app.ts',
      interpreter: './node_modules/.bin/ts-node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      }
    }]
  };
  