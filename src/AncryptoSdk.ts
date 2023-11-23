import CryptoJS from "crypto-js";
import { Provider, ethers } from "ethers";
import {
  ANCRYPTO_BACKEND_URL,
  CONTRACT_ADDRESS,
  BITCOIN_ACC_URL,
  VERIFICATION_BACKEND_URL,
} from "./constant";
import contractAbi from "../assets/abi.json";

//interfaces
import { ICreateSignature } from "./interfaces/signature.interfaces";
import { IRecoverAddresses } from "./interfaces/recoverAddress.interfaces";
import { IEncryptedMessage } from "./interfaces/encryptMessage.interfaces";
import { ICreateIdentity } from "./interfaces/createIdentity.interfaces";
import { IResolveRequestAddress } from "./interfaces/resolveAddress.interfaces";
import { IGetAddress } from "./interfaces/getAddress.interfaces";
import { AncryptoSdkInterface } from "./interfaces/ancryptoMethod";
import { IAddressVerificationData } from "./interfaces/addressesVerificationData.interface";

export class AncryptoSdk implements AncryptoSdkInterface {
  protected provider: Provider;
  protected contractObj: any;
  private x_access_key: string;
  private usernameAddressesMap: Map<string, Array<any>>;

  constructor(rpc: string, x_access_key: string = "") {
    this.x_access_key = x_access_key;

    this.provider = new ethers.JsonRpcProvider(rpc);

    this.contractObj = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      this.provider
    );

    this.usernameAddressesMap = new Map<string, Array<any>>();
  }

  /**get user signature */
  public async createSignature({
    username,
    privateKey,
  }: ICreateSignature): Promise<string> {
    const signer = new ethers.Wallet(privateKey, this.provider);
    return await signer.signMessage(username);
  }

  /**get user addresses */
  public recoverAddress({ username, signature }: IRecoverAddresses): string {
    return ethers.verifyMessage(username, signature);
  }
  /**
   *Check User Exist or not with the help of @Contract
   * @param username
   * @returns
   */
  public async isUserExist(username: string): Promise<boolean> {
    try {
      // Interact with the contract
      const userExists = await this.contractObj.getTokenURIFromUsernameTokenId(
        username
      );
      if (userExists !== "") {
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Encrypt a message using a secret key
  AncryptoSdkInterface 
   * @param message The message to encrypt
   * @param signature The secret key used for encryption
   * @returns The encrypted message
   */
  private async encryptMessage({ message, signature }: IEncryptedMessage) {
    const encrypted = CryptoJS.AES.encrypt(message, signature).toString();
    return encrypted;
  }

  /**
   * Decrypt an encrypted message using a secret key
   * @param encryptedMessage The encrypted message to decrypt
   * @param signature The secret key used for decryption
   * @returns The decrypted message
   */
  private async decryptMessage({ message, signature }: IEncryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(message, signature);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * post request to upload a meta data from backend
   *@post from backend
   **/
  public async createIdentity(requestData: ICreateIdentity): Promise<any> {
    try {
      //validation for addresses
      const userExists = await this.isUserExist(requestData.username);
      if (userExists) {
        throw Error("Username already exists!");
      }
      const encryptedData = await this.createJsonForEncryption(requestData);
      const obj: any = requestData;
      obj.data = encryptedData;

      const config = {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
          "X-ACCESS-KEY": this.x_access_key,
        },
      };

      const response = await fetch(
        `${ANCRYPTO_BACKEND_URL}users/decentralized`,
        config
      );
      if (response.ok) {
        return "response";
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * get resolve the address from encrypted data
   *
   */
  public async resolveAddress({
    username,
    network,
  }: IResolveRequestAddress): Promise<string> {
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
      const usernameExists = await this.isUserExist(username);
      if (!usernameExists) {
        throw Error("Username does not exist!");
      }

      let decryptedData: any = this.usernameAddressesMap.get(username);
      if (decryptedData) {
        return this.getAddress({ network, data: decryptedData });
      }
      const tokenURI = await this.contractObj.getTokenURIFromUsernameTokenId(
        username
      );

      let response = await fetch(tokenURI);
      if (!response.ok) {
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}`
        );
      }
      let data: any = await response.json();

      if (data && data.ancrypto_url) {
        response = await fetch(data.ancrypto_url);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
          );
        }
        data = await response.json();
        const encryptedData = data.data;
        // Retrieve the signature for the encrypted URL
        const config = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "json" as ResponseType,
        };
        response = await fetch(
          `${ANCRYPTO_BACKEND_URL}users/signature/${username}`,
          config
        );
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
          );
        }
        data = await response.json();
        const signature = data.data;

        // Decrypt the URL using a custom decryption function
        decryptedData = await this.decryptMessage({
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
    } catch (error) {
      // Error response received from the server
      // throw Error("An Error has occurred!");
      throw error;
    }
  }
  /**
   * get Address using network
   * @param network
   * @param data
   * @returns
   */
  private getAddress({ network, data }: IGetAddress) {
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
  public async getSignature(username: string) {
    try {
      if (!username && username.trim() === "") {
        throw new Error("Username is empty!");
      }
      if (username && username.length > 20) {
        throw new Error("Username must be less than 20 characters");
      }
      //check username exist or not
      const usernameExists = await this.isUserExist(username);
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
      let response = await fetch(
        `${ANCRYPTO_BACKEND_URL}users/signature/${username}`,
        config
      );
      if (!response.ok) {
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}`
        );
      }
      let data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   *make a json before encryption
   *
   */
  public async createJsonForEncryption(
    request: ICreateIdentity
  ): Promise<string> {
    const { username, address, signature, data } = request;
    const usernameRegex = /^[A-Za-z0-9_@-]+$/;
    try {
      if (!username && username.trim() === "") {
        throw Error("Username is empty!");
      }
      if (!username.match(usernameRegex)) {
        throw Error(
          "Invalid characters in username. Only uppercase, lowercase, @, -, and _ are allowed!"
        );
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
      return await this.encryptMessage({
        message: str,
        signature: signature,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * update the addresses
   *
   **/
  public async updateIdentity(requestData: ICreateIdentity) {
    try {
      //validation for addresses
      const userExists = await this.isUserExist(requestData.username);
      if (!userExists) {
        throw Error("Username does not exists!");
      }
      const encryptedData = await this.createJsonForEncryption(requestData);
      const obj: any = requestData;
      obj.data = encryptedData;

      const config = {
        method: "PUT",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
          "X-ACCESS-KEY": this.x_access_key,
        },
      };
      const response = await fetch(
        `${ANCRYPTO_BACKEND_URL}users/decentralized`,
        config
      );
      if (!response.ok) {
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}`
        );
      }
      let data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
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
  public async verificationAddresses(
    request: IAddressVerificationData
  ): Promise<boolean> {
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
      const response = await fetch(VERIFICATION_BACKEND_URL, config);
      if (!response.ok) {
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}`
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
