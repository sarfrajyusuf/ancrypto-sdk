import { Provider } from "ethers";
import { ICreateSignature } from "./interfaces/signature.interfaces";
import { IRecoverAddresses } from "./interfaces/recoverAddress.interfaces";
import { ICreateIdentity } from "./interfaces/createIdentity.interfaces";
import { IResolveRequestAddress } from "./interfaces/resolveAddress.interfaces";
import { AncryptoSdkInterface } from "./interfaces/ancryptoMethod";
import { IAddressVerificationData } from "./interfaces/addressesVerificationData.interface";
export declare class AncryptoSdk implements AncryptoSdkInterface {
    protected provider: Provider;
    protected contractObj: any;
    private x_access_key;
    private usernameAddressesMap;
    constructor(rpc: string, x_access_key?: string);
    /**get user signature */
    createSignature({ username, privateKey, }: ICreateSignature): Promise<string>;
    /**get user addresses */
    recoverAddress({ username, signature }: IRecoverAddresses): string;
    /**
     *Check User Exist or not with the help of @Contract
     * @param username
     * @returns
     */
    isUserExist(username: string): Promise<boolean>;
    /**
     * Encrypt a message using a secret key
    AncryptoSdkInterface
     * @param message The message to encrypt
     * @param signature The secret key used for encryption
     * @returns The encrypted message
     */
    private encryptMessage;
    /**
     * Decrypt an encrypted message using a secret key
     * @param encryptedMessage The encrypted message to decrypt
     * @param signature The secret key used for decryption
     * @returns The decrypted message
     */
    private decryptMessage;
    /**
     * post request to upload a meta data from backend
     *@post from backend
     **/
    createIdentity(requestData: ICreateIdentity): Promise<any>;
    /**
     * get resolve the address from encrypted data
     *
     */
    resolveAddress({ username, network, }: IResolveRequestAddress): Promise<string>;
    /**
     * get Address using network
     * @param network
     * @param data
     * @returns
     */
    private getAddress;
    /**
     * get signature from username
     * @param username
     * @param network
     * @return
     */
    getSignature(username: string): Promise<any>;
    /**
     *make a json before encryption
     *
     */
    createJsonForEncryption(request: ICreateIdentity): Promise<string>;
    /**
     * update the addresses
     *
     **/
    updateIdentity(requestData: ICreateIdentity): Promise<any>;
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
    verificationAddresses(request: IAddressVerificationData): Promise<boolean>;
}
