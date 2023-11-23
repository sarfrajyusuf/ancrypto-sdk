export interface IAddressVerificationData {
  username: string;
  data: Array<
    Partial<{
      [key: string]: string;
      sign: string;
      polygon: string;
      bsc: string;
      nrk: string;
      ftm: string;
      eth: string;
      tron: string;
      doge: string;
      ltc: string;
      xtz: string;
      bch: string;
      btc: string;
    }>
  >;
}
