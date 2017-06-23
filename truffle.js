module.exports = {
    networks: {
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,
            gas: 2000000,
            gasPrice: "77000000000"
            //,from: "0xADDRRESS"
        },
        development: {
          host: "localhost",
          gas: 4600000,
          port: 8555,
          network_id: "*" // Match any network id
        }
    }
};
