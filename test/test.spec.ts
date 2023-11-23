import chai from "chai";
import { expect } from "chai";
import { AncryptoSdk } from "../src/index";
// import sampleData from "../assets/sample.json";
import sampleData2 from "../assets/sample2.json";
import sampleData3 from "../assets/sample3.json";
import sampleData4 from "../assets/sample4.json";
import { OPBNB_TESTNET_RPC, POLYGON_TESTNET_RPC } from "../src/constant";
import chaiAsPromised from "chai-as-promised";

// Extend Chai with chai-as-promised
chai.use(chaiAsPromised);

// dotenv.config({ path: path.join(__dirname,"../../../.env") });

const ethereumNodeUrl = OPBNB_TESTNET_RPC;
const username = "sarfraj8";
const address = "0xc0F3B0e5dA53aAEFcF568c9a31B027cC89D51dB2";
const privateKey =
  "0x079c7439d1296d682e453555d5b3e5d371639f50899e3b8d42c36b3e555c8938";

describe("Using SDK for User Identity", () => {
  const obj = new AncryptoSdk(ethereumNodeUrl, "sandbox_373QY3dgYBjTnwwI");
  let signature: string;

  describe("Check Username Exist or not", () => {
    it("Should be username already exist", async () => {
      expect(await obj.isUserExist(username)).to.be.equal(true);
    });

    it("Should be username does not exist", async () => {
      expect(await obj.isUserExist("username")).to.be.equal(false);
    });
  });

  describe("creating signature", () => {
    it("Should be Create Signature", async () => {
      signature = await obj.createSignature({ username, privateKey });
      expect(signature.length).to.be.equal(132);
    });
  });

  describe("recover signature", () => {
    it("Should be Recover signature", async () => {
      // Recover the address from the signature and message
      const recoveredAddress = obj.recoverAddress({ username, signature });
      expect(recoveredAddress.toLowerCase()).to.be.equal(address.toLowerCase());
    });
  });

  describe.only("post user identity request on blockchain", () => {
    /**
     *validation for username
     **/
    it("Should throw an error if username not match with special characters", async () => {
      const requestData = {
        address,
        username: "sarfraj%",
        // Invalid: empty username
        signature: "signature",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "Invalid characters in username. Only uppercase, lowercase, @, -, and _ are allowed!"
      );
    });

    it("Should throw an error if username is not provided", async () => {
      const requestData = {
        address,
        username: "", // Invalid: empty username
        signature: "signature",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "Username is empty!"
      );
    });

    /**
     *validation for username character
     **/
    it("Should throw an error if username is longer than 20 characters", async () => {
      const requestData = {
        address,
        username: "sarfraj2sarfraj2sarfraj2", //Invalid:long characters
        signature: "signature",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "Username must be less than 20 characters"
      );
    });

    /**
     *validation for address
     **/
    it("Should throw an error if invalid address", async () => {
      const requestData = {
        address: "address",
        username,
        signature: "signature",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "From address is not a valid address"
      );
    });
    /**
     *validation for signature
     **/
    it("Should throw an error if invalid signature", async () => {
      const requestData = {
        address,
        username, //Invalid:long characters
        signature: "",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "Signature is required!"
      );
    });

    /**
     *validation for addresses
     **/
    it("Should throw an error if invalid addresses", async () => {
      const requestData = {
        address,
        username, //Invalid:long characters
        signature: "signature",
        data: [],
      };
      await expect(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(
        Error,
        "Addresses are required as per sample data!"
      );
    });

    it("Should be encrypted string using signature", async () => {
      // Recover the address from the signature and message
      const jsonData = await obj.createJsonForEncryption(sampleData2);
      expect(jsonData).to.be.a("string");
    });

    it("Should be post the data on blockchain", async () => {
      const requestData = {
        address,
        username: "sarfraj2",
        signature: "signature",
        data: ["m"],
      };
      await expect(obj.createIdentity(requestData)).to.be.rejectedWith(
        Error,
        "Username already exists!"
      );
    });
    //important
    it.only("Should be post the data on blockchain successfully", async () => {
      try {
        const res: any = await obj.createIdentity(sampleData4);
        expect(res).to.be.a("string");
      } catch (error: any) {
        //axios errors
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          console.log("Error: ", error.response.data.error);
          // if(error.response.data.error === "Username already exists!"){}
        } else {
          console.log(error);
        }
      }
    });
  });

  // resolver test case
  describe("Resolve Address as per network", () => {
    /**
     *check username is empty or not ?
     */
    it("Should throw an error when the username does not exist", async () => {
      const requestData = {
        username: "sarfraj31",
        network: "eth",
      };
      await expect(obj.resolveAddress(requestData)).to.be.rejectedWith(
        Error,
        "Username does not exist!"
      );
    });

    /**
     *check username is less than 20 or not ?
     */
    it("Should throw an error if username is longer than 20 characters", async () => {
      const requestData = {
        username: "sarfraj2 sarfraj2 sarfraj2 ", //Invalid:long characters
      };
      await expect(
        obj.resolveAddress({ username: requestData.username, network: "eth" })
      ).to.be.rejectedWith(Error, "Username must be less than 20 characters");
    });

    it("Should throw an error if network is not provided", async () => {
      const requestData = {
        username: username,
        network: "",
      };
      await expect(
        obj.resolveAddress({
          username: requestData.username,
          network: requestData.network,
        })
      ).to.be.rejectedWith(Error, "Network is empty!");
    });
  });
  describe("Address Resolve as per network", () => {
    //imporant
    it("Should be resolve address", async () => {
      const res = await obj.resolveAddress({
        username: "sarfraj5",
        network: "eth",
      });
      expect(res).to.be.equal("0xfea1ad1281ce4e11e6c13b52cc1fd62072f0b23d");
    });
  });

  describe("Get Signature as per username", () => {
    it("Should throw an error if username is not provided", async () => {
      await expect(obj.getSignature("")).to.be.rejectedWith(
        Error,
        "Username is empty!"
      );
    });

    it("Should throw an error when the username does not exist", async () => {
      const requestData = {
        username: "sarfraj31",
      };
      await expect(obj.getSignature(requestData.username)).to.be.rejectedWith(
        Error,
        "Username does not exist!"
      );
    });

    it("Should throw an error if username is longer than 20 characters", async () => {
      const requestData = {
        username: "sarfraj2sarfraj2sarfraj2", //Invalid:long characters
      };
      await expect(obj.getSignature(requestData.username)).to.be.rejectedWith(
        Error,
        "Username must be less than 20 characters"
      );
    });

    it("Should be resolve address", async () => {
      const res = await obj.getSignature("sarfraj8");
      const address = await obj.recoverAddress({
        username: "sarfraj8",
        signature: res,
      });
      expect(address.toLowerCase()).to.be.equal(
        "0x68673c6e0ff955731334999f63b0083689318c31"
      );
    });
  });

  //update addresses
  describe("update addresses on blockchain", () => {
    /**
     *check username is empty or not ?
     */
    it("Should throw an error when the username does not exist", async () => {
      const requestData = {
        address,
        username: "sarfraj44",
        signature: "signature",
        data: ["m"],
      };

      await expect(obj.updateIdentity(requestData)).to.be.rejectedWith(
        Error,
        "Username does not exists!"
      );
    });
    it("Should be able to update addresses on blockchain", async () => {
      try {
        const res: any = await obj.updateIdentity(sampleData3);
        expect(res).to.be.a("string");
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          console.log("Error: ", error.response.data.error);
        } else {
          console.log(error);
        }
      }
    });
  });

  //verifications userIdentity
  describe("Verification of addresses of sdk", () => {
    it("should throw an error when signature is not provided for network", async () => {
      const request = {
        username: "testuser",
        data: [{ eth: "validEthAddress1", sign: "" }],
      };

      await expect(obj.verificationAddresses(request)).to.be.rejectedWith(
        "Empty signature!"
      );
    });

    it("should throw an error when address is not provided", async () => {
      const request = {
        username: "testuser",
        data: [{ eth: "", sign: "validSignature1" }],
      };

      await expect(obj.verificationAddresses(request)).to.be.rejectedWith(
        "Empty address!"
      );
    });

    it("Should throw an error for invalid Ethereum address", async () => {
      const request = {
        username: "testuser",
        data: [
          {
            eth: "test address",
            sign: "testsignature",
          },
        ],
      };
      await expect(obj.verificationAddresses(request)).to.be.rejectedWith(
        "Invalid eth address!"
      );
    });

    it("Should throw an error if the signature for invalid", async () => {
      const requestData = {
        username: "testUser",
        data: [
          {
            polygon: "0x05305eb46107bf9b05f01fc3728b23e6f5e3263e",
            sign: "0xc8d5ed0831cdad673221a2a31af63ecd3d3a4f0ad2e30d7f7a3d7def427ed37e5d1a8ae06c6b95feed59c41d2e5dd9db5f7aed8bb8856ad04d68c974967364221b",
          },
          {
            polygon: "0x05305eb46107bf9b05f01fc3728b23e6f5e3263e",
            sign: "invalidsignature",
          }, // Invalid Polygon signature
        ],
      };

      await expect(obj.verificationAddresses(requestData)).to.be.rejectedWith(
        "Invalid Signature polygon!"
      );
    });

    it("Should be able to verify the address", async () => {
      const a = await obj.verificationAddresses(sampleData4);
      expect(a).to.equal(true);
    });
  });
});
