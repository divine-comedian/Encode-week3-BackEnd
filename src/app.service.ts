import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/Ballot.json';

// why can't I get my contract address from the env variable globally? (throws error)
// const tokenContractAddress = process.env.MY_TOKEN;
// change these addresses to hardcode them for use
const tokenAddress = '0xB46C4e94fbB1e447a0E64F37CDE249F65E5147D3';
const mintAmount = ethers.utils.parseEther('1');
const ballotAddress = '0x8f1c4B0bB325Ba77029AA172cB7C48746Ee8fAEd';

@Injectable()
export class AppService {
  // change this to your provider or default
  provider: ethers.providers.AlchemyProvider;
  erc20Contract: ethers.Contract;
  proposals: string[] | undefined;
  erc20ContractFactory: ethers.ContractFactory;
  ballotContractFactory: ethers.ContractFactory;
  constructor() {
    // reaplace with your api provider
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      process.env.ALCHEMY_API_KEY,
    );
    this.erc20ContractFactory = new ethers.ContractFactory(
      tokenJson.abi,
      tokenJson.bytecode,
    );
    this.ballotContractFactory = new ethers.ContractFactory(
      ballotJson.abi,
      ballotJson.bytecode,
    );
    // replace with your connection method

    //  console.log(signer);
    //  console.log(this.erc20Contract);
  }
  getProposals() {
    return this.proposals;
  }
  getTokenAddress() {
    return tokenAddress;
  }
  async requestTokens(body: any) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '');
    const signer = wallet.connect(this.provider);
    //define ballot contract
    const ballotContract = this.ballotContractFactory
      .attach(ballotAddress)
      .connect(signer);
    // giveRightToVote
    const giveRightToVote = await ballotContract.giveRightToVote(body.address);
    await giveRightToVote.wait();
    // define erc20Contract
    const erc20Contract = this.erc20ContractFactory
      .attach(tokenAddress)
      .connect(signer);
    // mint tokens here
    const mintTokens = await erc20Contract.mint(body.address, mintAmount);
    console.log(
      `Tokens minted successfully to ${body.address}, the transaction can be found at ${mintTokens}`,
    );
    // delegate tokens on ballot
    return mintTokens.wait();
  }
}
