'use strict';

exports.config = {
  capabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        args: ['window-size=1200,800']
      }
    }
  ],
  services: ['chromedriver'],
  port: 9515, // default
  path: '/',
  chromeDriverArgs: ['--port=9515'], // default
  chromeDriverLogs: './',
  specs: ['./test/specs/*.js'],
  exclude: [],
  maxInstances: 1,
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  waitforTimeout: 20000,
  connectionRetryTimeout: 10000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000
  },
  seleniumArgs: {
    version: '3.10.0'
  },
  seleniumInstallArgs: {
    version: '3.10.0'
  }
};