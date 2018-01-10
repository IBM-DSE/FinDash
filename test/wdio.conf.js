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
  services: ['selenium-standalone'],
  specs: ['./test/specs/*.js'],
  exclude: [],
  maxInstances: 2,
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
    version: '3.0.1'
  },
  seleniumInstallArgs: {
    version: '3.0.1'
  }
};