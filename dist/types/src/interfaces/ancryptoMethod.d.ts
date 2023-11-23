import { ICreateIdentity } from "./createIdentity.interfaces";
import { IResolveRequestAddress } from "./resolveAddress.interfaces";
export interface AncryptoSdkInterface {
    createIdentity: (data: ICreateIdentity) => Promise<string>;
    resolveAddress: (data: IResolveRequestAddress) => Promise<string>;
    createJsonForEncryption: (data: ICreateIdentity) => Promise<string>;
    getSignature: (data: string) => Promise<string>;
}
