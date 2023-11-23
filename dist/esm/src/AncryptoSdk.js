var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import { ANCRYPTO_BACKEND_URL, CONTRACT_ADDRESS, VERIFICATION_BACKEND_URL, } from "./constant";
import contractAbi from "../assets/abi.json";
export class AncryptoSdk {
    constructor(rpc, x_access_key = "") {
        this.x_access_key = x_access_key;
        this.provider = new ethers.JsonRpcProvider(rpc);
        this.contractObj = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, this.provider);
        this.usernameAddressesMap = new Map();
    }
    /**get user signature */
    createSignature({ username, privateKey, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = new ethers.Wallet(privateKey, this.provider);
            return yield signer.signMessage(username);
        });
    }
    /**get user addresses */
    recoverAddress({ username, signature }) {
        return ethers.verifyMessage(username, signature);
    }
    /**
     *Check User Exist or not with the help of @Contract
     * @param username
     * @returns
     */
    isUserExist(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Interact with the contract
                const userExists = yield this.contractObj.getTokenURIFromUsernameTokenId(username);
                if (userExists !== "") {
                    return true;
                }
                return false;
            }
            catch (error) {
                return false;
            }
        });
    }
    /**
     * Encrypt a message using a secret key
    AncryptoSdkInterface
     * @param message The message to encrypt
     * @param signature The secret key used for encryption
     * @returns The encrypted message
     */
    encryptMessage({ message, signature }) {
        return __awaiter(this, void 0, void 0, function* () {
            const encrypted = CryptoJS.AES.encrypt(message, signature).toString();
            return encrypted;
        });
    }
    /**
     * Decrypt an encrypted message using a secret key
     * @param encryptedMessage The encrypted message to decrypt
     * @param signature The secret key used for decryption
     * @returns The decrypted message
     */
    decryptMessage({ message, signature }) {
        return __awaiter(this, void 0, void 0, function* () {
            const bytes = CryptoJS.AES.decrypt(message, signature);
            return bytes.toString(CryptoJS.enc.Utf8);
        });
    }
    /**
     * post request to upload a meta data from backend
     *@post from backend
     **/
    createIdentity(requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //validation for addresses
                const userExists = yield this.isUserExist(requestData.username);
                if (userExists) {
                    throw Error("Username already exists!");
                }
                const encryptedData = yield this.createJsonForEncryption(requestData);
                const obj = requestData;
                obj.data = encryptedData;
                const config = {
                    method: "POST",
                    body: JSON.stringify(obj),
                    headers: {
                        "Content-Type": "application/json",
                        "X-ACCESS-KEY": this.x_access_key,
                    },
                };
                const response = yield fetch(`${ANCRYPTO_BACKEND_URL}users/decentralized`, config);
                if (response.ok) {
                    return "response";
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * get resolve the address from encrypted data
     *
     */
    resolveAddress({ username, network, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //username is required
                if (!username && username.trim() === "") {
                    throw Error("Username is empty!");
                }
                //username less than 20 character
                if (username && username.length > 20) {
                    throw Error("Username must be less than 20 characters");
                }
                if (!network && network.trim() === "") {
                    throw Error("Network is empty!");
                }
                //check username exist or not
                const usernameExists = yield this.isUserExist(username);
                if (!usernameExists) {
                    throw Error("Username does not exist!");
                }
                let decryptedData = this.usernameAddressesMap.get(username);
                if (decryptedData) {
                    return this.getAddress({ network, data: decryptedData });
                }
                const tokenURI = yield this.contractObj.getTokenURIFromUsernameTokenId(username);
                let response = yield fetch(tokenURI);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                let data = yield response.json();
                if (data && data.ancrypto_url) {
                    response = yield fetch(data.ancrypto_url);
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                    }
                    data = yield response.json();
                    const encryptedData = data.data;
                    // Retrieve the signature for the encrypted URL
                    const config = {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        responseType: "json",
                    };
                    response = yield fetch(`${ANCRYPTO_BACKEND_URL}users/signature/${username}`, config);
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                    }
                    data = yield response.json();
                    const signature = data.data;
                    // Decrypt the URL using a custom decryption function
                    decryptedData = yield this.decryptMessage({
                        message: encryptedData,
                        signature,
                    });
                    if (decryptedData) {
                        decryptedData = JSON.parse(decryptedData);
                        this.usernameAddressesMap.set(username, decryptedData);
                        return this.getAddress({ network, data: decryptedData });
                    }
                }
                return "";
            }
            catch (error) {
                // Error response received from the server
                // throw Error("An Error has occurred!");
                throw error;
            }
        });
    }
    /**
     * get Address using network
     * @param network
     * @param data
     * @returns
     */
    getAddress({ network, data }) {
        for (let a of data.data) {
            if (a[network]) {
                return a[network];
            }
        }
        return "";
    }
    /**
     * get signature from username
     * @param username
     * @param network
     * @return
     */
    getSignature(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!username && username.trim() === "") {
                    throw new Error("Username is empty!");
                }
                if (username && username.length > 20) {
                    throw new Error("Username must be less than 20 characters");
                }
                //check username exist or not
                const usernameExists = yield this.isUserExist(username);
                if (!usernameExists) {
                    throw Error("Username does not exist!");
                }
                // Retrieve the signature for the encrypted URL
                const config = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                let response = yield fetch(`${ANCRYPTO_BACKEND_URL}users/signature/${username}`, config);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                let data = yield response.json();
                return data.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     *make a json before encryption
     *
     */
    createJsonForEncryption(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, address, signature, data } = request;
            const usernameRegex = /^[A-Za-z0-9_@-]+$/;
            try {
                if (!username && username.trim() === "") {
                    throw Error("Username is empty!");
                }
                if (!username.match(usernameRegex)) {
                    throw Error("Invalid characters in username. Only uppercase, lowercase, @, -, and _ are allowed!");
                }
                //username less than 20 character
                if (username && username.length > 20) {
                    throw Error("Username must be less than 20 characters");
                }
                //is username exists code here
                if (address && !ethers.isAddress(address)) {
                    throw Error("From address is not a valid address");
                }
                //validation for signature
                if (!signature) {
                    throw Error("Signature is required!");
                }
                if (data.length === 0) {
                    throw Error("Addresses are required as per sample data!");
                }
                const recoverAddress = this.recoverAddress({ username, signature });
                if (recoverAddress.toLowerCase() !== address.toLowerCase()) {
                    throw Error("Invalid signature!");
                }
                /**
                 * TODO: skip this verification step
                 */
                // const result = await this.verificationAddresses({ username, addresses });
                // if (!result) {
                //   throw Error("Invalid addresses!");
                // }
                const obj = {
                    name: username,
                    data,
                };
                const str = JSON.stringify(obj);
                return yield this.encryptMessage({
                    message: str,
                    signature: signature,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * update the addresses
     *
     **/
    updateIdentity(requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //validation for addresses
                const userExists = yield this.isUserExist(requestData.username);
                if (!userExists) {
                    throw Error("Username does not exists!");
                }
                const encryptedData = yield this.createJsonForEncryption(requestData);
                const obj = requestData;
                obj.data = encryptedData;
                const config = {
                    method: "PUT",
                    body: JSON.stringify(obj),
                    headers: {
                        "Content-Type": "application/json",
                        "X-ACCESS-KEY": this.x_access_key,
                    },
                };
                const response = yield fetch(`${ANCRYPTO_BACKEND_URL}users/decentralized`, config);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                let data = yield response.json();
                return data.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * verificationAddresses
     * @param username
     * @param address
     * @param data
     * @param network
     * @returns
     */
    /**
     * TODO: skip this verification step
     */
    verificationAddresses(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, data } = request;
                for (let v of data) {
                    if (!v.sign) {
                        throw new Error(`Empty signature!`);
                    }
                }
                const requestObj = {
                    username,
                    data,
                };
                const config = {
                    method: "POST",
                    body: JSON.stringify(requestObj),
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                const response = yield fetch(VERIFICATION_BACKEND_URL, config);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                return true;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
