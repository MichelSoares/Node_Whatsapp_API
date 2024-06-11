export const environment = {

    nodeEnv: process.env.ENV || process.env.NODE_ENV,
  
    logDir:  `logs`,
  
    logLevel: process.env.LOG_LEVEL || 'info',
  
    logFile: process.env.LOG_FILE || 'app.log',
  
    // Other environment variables
  
  }