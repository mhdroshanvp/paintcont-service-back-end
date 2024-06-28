module.exports = {
    apps: [{
      name: 'paintcont-service-backend',
      script: 'src/app.ts',
      interpreter: 'node',
      interpreter_args: '-r ts-node/register',
      env: {
        NODE_ENV: 'production',
        PORT: 7777,
      }
    }]
  };  