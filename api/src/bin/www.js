#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../../app');
const http = require('http');
const cluster = require('cluster');
const logger = require('../helpers/logger');
const {useMultipleCpus} = require('../config');

app.set('logger', logger);

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

if (cluster.isMaster) {
  const numWorkers = useMultipleCpus ? require('os').cpus().length : 1;

  logger.info(`Master cluster setting up ${numWorkers} workers...`);

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', function(worker) {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', function(worker, code, signal) {
    logger.error(`Worker died`, {pid: worker.process.pid, code, signal});
    logger.info('Starting a new worker');
    cluster.fork();
  });
} else {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break; // eslint-disable-line
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break; // eslint-disable-line
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logger.info(`Listening on ${bind}`);
}
