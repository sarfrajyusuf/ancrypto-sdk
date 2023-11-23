"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_2 = require("chai");
const index_1 = require("../src/index");
// import sampleData from "../assets/sample.json";
const sample2_json_1 = __importDefault(require("../assets/sample2.json"));
const sample3_json_1 = __importDefault(require("../assets/sample3.json"));
const sample4_json_1 = __importDefault(require("../assets/sample4.json"));
const constant_1 = require("../src/constant");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
// Extend Chai with chai-as-promised
chai_1.default.use(chai_as_promised_1.default);
// dotenv.config({ path: path.join(__dirname,"../../../.env") });
const ethereumNodeUrl = constant_1.OPBNB_TESTNET_RPC;
const username = "sarfraj8";
const address = "0xc0F3B0e5dA53aAEFcF568c9a31B027cC89D51dB2";
const privateKey = "0x079c7439d1296d682e453555d5b3e5d371639f50899e3b8d42c36b3e555c8938";
describe("Using SDK for User Identity", () => {
    const obj = new index_1.AncryptoSdk(ethereumNodeUrl, "sandbox_373QY3dgYBjTnwwI");
    let signature;
    describe("Check Username Exist or not", () => {
        it("Should be username already exist", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, chai_2.expect)(yield obj.isUserExist(username)).to.be.equal(true);
        }));
        it("Should be username does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, chai_2.expect)(yield obj.isUserExist("username")).to.be.equal(false);
        }));
    });
    describe("creating signature", () => {
        it("Should be Create Signature", () => __awaiter(void 0, void 0, void 0, function* () {
            signature = yield obj.createSignature({ username, privateKey });
            (0, chai_2.expect)(signature.length).to.be.equal(132);
        }));
    });
    describe("recover signature", () => {
        it("Should be Recover signature", () => __awaiter(void 0, void 0, void 0, function* () {
            // Recover the address from the signature and message
            const recoveredAddress = obj.recoverAddress({ username, signature });
            (0, chai_2.expect)(recoveredAddress.toLowerCase()).to.be.equal(address.toLowerCase());
        }));
    });
    describe.only("post user identity request on blockchain", () => {
        /**
         *validation for username
         **/
        it("Should throw an error if username not match with special characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username: "sarfraj%",
                // Invalid: empty username
                signature: "signature",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "Invalid characters in username. Only uppercase, lowercase, @, -, and _ are allowed!");
        }));
        it("Should throw an error if username is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username: "",
                signature: "signature",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "Username is empty!");
        }));
        /**
         *validation for username character
         **/
        it("Should throw an error if username is longer than 20 characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username: "sarfraj2sarfraj2sarfraj2",
                signature: "signature",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "Username must be less than 20 characters");
        }));
        /**
         *validation for address
         **/
        it("Should throw an error if invalid address", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address: "address",
                username,
                signature: "signature",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "From address is not a valid address");
        }));
        /**
         *validation for signature
         **/
        it("Should throw an error if invalid signature", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username,
                signature: "",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "Signature is required!");
        }));
        /**
         *validation for addresses
         **/
        it("Should throw an error if invalid addresses", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username,
                signature: "signature",
                data: [],
            };
            yield (0, chai_2.expect)(obj.createJsonForEncryption(requestData)).to.be.rejectedWith(Error, "Addresses are required as per sample data!");
        }));
        it("Should be encrypted string using signature", () => __awaiter(void 0, void 0, void 0, function* () {
            // Recover the address from the signature and message
            const jsonData = yield obj.createJsonForEncryption(sample2_json_1.default);
            (0, chai_2.expect)(jsonData).to.be.a("string");
        }));
        it("Should be post the data on blockchain", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username: "sarfraj2",
                signature: "signature",
                data: ["m"],
            };
            yield (0, chai_2.expect)(obj.createIdentity(requestData)).to.be.rejectedWith(Error, "Username already exists!");
        }));
        //important
        it.only("Should be post the data on blockchain successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield obj.createIdentity(sample4_json_1.default);
                (0, chai_2.expect)(res).to.be.a("string");
            }
            catch (error) {
                //axios errors
                if (error.response &&
                    error.response.data &&
                    error.response.data.error) {
                    console.log("Error: ", error.response.data.error);
                    // if(error.response.data.error === "Username already exists!"){}
                }
                else {
                    console.log(error);
                }
            }
        }));
    });
    // resolver test case
    describe("Resolve Address as per network", () => {
        /**
         *check username is empty or not ?
         */
        it("Should throw an error when the username does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                username: "sarfraj31",
                network: "eth",
            };
            yield (0, chai_2.expect)(obj.resolveAddress(requestData)).to.be.rejectedWith(Error, "Username does not exist!");
        }));
        /**
         *check username is less than 20 or not ?
         */
        it("Should throw an error if username is longer than 20 characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                username: "sarfraj2 sarfraj2 sarfraj2 ", //Invalid:long characters
            };
            yield (0, chai_2.expect)(obj.resolveAddress({ username: requestData.username, network: "eth" })).to.be.rejectedWith(Error, "Username must be less than 20 characters");
        }));
        it("Should throw an error if network is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                username: username,
                network: "",
            };
            yield (0, chai_2.expect)(obj.resolveAddress({
                username: requestData.username,
                network: requestData.network,
            })).to.be.rejectedWith(Error, "Network is empty!");
        }));
    });
    describe("Address Resolve as per network", () => {
        //imporant
        it("Should be resolve address", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield obj.resolveAddress({
                username: "sarfraj5",
                network: "eth",
            });
            (0, chai_2.expect)(res).to.be.equal("0xfea1ad1281ce4e11e6c13b52cc1fd62072f0b23d");
        }));
    });
    describe("Get Signature as per username", () => {
        it("Should throw an error if username is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, chai_2.expect)(obj.getSignature("")).to.be.rejectedWith(Error, "Username is empty!");
        }));
        it("Should throw an error when the username does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                username: "sarfraj31",
            };
            yield (0, chai_2.expect)(obj.getSignature(requestData.username)).to.be.rejectedWith(Error, "Username does not exist!");
        }));
        it("Should throw an error if username is longer than 20 characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                username: "sarfraj2sarfraj2sarfraj2", //Invalid:long characters
            };
            yield (0, chai_2.expect)(obj.getSignature(requestData.username)).to.be.rejectedWith(Error, "Username must be less than 20 characters");
        }));
        it("Should be resolve address", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield obj.getSignature("sarfraj8");
            const address = yield obj.recoverAddress({
                username: "sarfraj8",
                signature: res,
            });
            (0, chai_2.expect)(address.toLowerCase()).to.be.equal("0x68673c6e0ff955731334999f63b0083689318c31");
        }));
    });
    //update addresses
    describe("update addresses on blockchain", () => {
        /**
         *check username is empty or not ?
         */
        it("Should throw an error when the username does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = {
                address,
                username: "sarfraj44",
                signature: "signature",
                data: ["m"],
            };
            yield (0, chai_2.expect)(obj.updateIdentity(requestData)).to.be.rejectedWith(Error, "Username does not exists!");
        }));
        it("Should be able to update addresses on blockchain", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield obj.updateIdentity(sample3_json_1.default);
                (0, chai_2.expect)(res).to.be.a("string");
            }
            catch (error) {
                if (error.response &&
                    error.response.data &&
                    error.response.data.error) {
                    console.log("Error: ", error.response.data.error);
                }
                else {
                    console.log(error);
                }
            }
        }));
    });
    //verifications userIdentity
    describe("Verification of addresses of sdk", () => {
        it("should throw an error when signature is not provided for network", () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {
                username: "testuser",
                data: [{ eth: "validEthAddress1", sign: "" }],
            };
            yield (0, chai_2.expect)(obj.verificationAddresses(request)).to.be.rejectedWith("Empty signature!");
        }));
        it("should throw an error when address is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {
                username: "testuser",
                data: [{ eth: "", sign: "validSignature1" }],
            };
            yield (0, chai_2.expect)(obj.verificationAddresses(request)).to.be.rejectedWith("Empty address!");
        }));
        it("Should throw an error for invalid Ethereum address", () => __awaiter(void 0, void 0, void 0, function* () {
            const request = {
                username: "testuser",
                data: [
                    {
                        eth: "test address",
                        sign: "testsignature",
                    },
                ],
            };
            yield (0, chai_2.expect)(obj.verificationAddresses(request)).to.be.rejectedWith("Invalid eth address!");
        }));
        it("Should throw an error if the signature for invalid", () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, chai_2.expect)(obj.verificationAddresses(requestData)).to.be.rejectedWith("Invalid Signature polygon!");
        }));
        it("Should be able to verify the address", () => __awaiter(void 0, void 0, void 0, function* () {
            const a = yield obj.verificationAddresses(sample4_json_1.default);
            (0, chai_2.expect)(a).to.equal(true);
        }));
    });
});
