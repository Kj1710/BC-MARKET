module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     
      port: 7545,            
      network_id: "*",     
    },
  },

  db: {
    enabled: false
  },

  compilers: {
    solc: {
      version: "^0.6.0",    
      docker: false,        
      settings: {         
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "petersburg"
      }
    }
  }
}
