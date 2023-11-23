# AncryptoSDK

The Ancrypto SDK is a software development kit (SDK) that provides a set of tools and functions for interacting with the Ancrypto platform. It simplifies the integration of Ancrypto functionalities into your applications, allowing you to easily perform operations such as user address retrieval, data encryption and decryption, IPFS interaction, and more.

### Installation

To use the AncryptoSdk library, you need to have Node.js installed. You can install the library using npm or yarn.

To install the Ancrypto SDK, follow these steps:

```bash
npm install ancrypto-sdk-test

```

## Usage

After installation add this to your package

```ts
import { AncryptoSdk } from "ancrypto-sdk-test";
```

### Create an instance of the AncryptoSdk class, providing the necessary parameters:

To initialize the AncryptoSdk, you need to provide the RPC endpoint and an optional x_access_key if required by the backend.

```ts
const rpc = "YOUR_RPC_ENDPOINT"; // polygon testnet https://rpc-mumbai.maticvigil.com/
//api key
const x_access_key = "YOUR_X_ACCESS_KEY"; // Optional

const ancryptoSdk = new AncryptoSdk(rpc, x_access_key);
```

### Create Identity for Resolving Address

Create identity is a method that upload the data on blockchain with the help of api

```ts
...
const requestData = {
  username: "user123",
  address: "0x123...",
  signature: "<signature create with username and evm address>",
  addresses: [
      {
      "eth": "0x312d175e0bBd968e8a56Af2D28CEfee671002290",
        // create signature with username and this address
      "sign": "0x3f2c13d3aee1234dd8ebab0cb7dbb630260ee6d96c2f97af85c3177c622851d4663ff45cd6e86ee86fb29cb19793669886d620d6672201b152f9718aadae12af1c"
    },
    {
      "bsc": "0x312d175e0bBd968e8a56Af2D28CEfee671002290",
        // create signature with username and this address
      "sign": "0x3f2c13d3aee1234dd8ebab0cb7dbb630260ee6d96c2f97af85c3177c622851d4663ff45cd6e86ee86fb29cb19793669886d620d6672201b152f9718aadae12af1c"
    },
    ]
    ...
};
const identity = await ancryptoSdk.createIdentity(requestData);
console.log("Created Identity:", identity);
...


```

### Utilize the various methods of the SDK for your desired functionality. Here's an example of how to retrieve a user's address:

```ts
const username = "your username";
const network = "eth"; //chain should be : eth, polygon, nrk, ftm, tron, bsc, bch, btc,ltc,doge, xtz
...
try {
  const address = await sdk.resolveAddress(username, network);
  console.log("User Address:", address);
} catch (error) {
  console.error("Error:", error.message);
}
...

```

### NOTE: CahinId should be eth, nrk, tron, bsc, bch, btc, polygon, ftm, doge, ltc, xtz

## Contributing

Contributions to the Ancrypto SDK are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License
