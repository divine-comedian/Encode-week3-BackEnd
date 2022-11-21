import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/Ballot.json';
import { mintDto } from './app.controller';

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
  tokenizedVote: ethers.Contract;
  proposals: string[] | undefined;
  tokenizedVoteFactory: ethers.ContractFactory;
  ballotContractFactory: ethers.ContractFactory;

  constructor() {
    // reaplace with your api provider
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      process.env.ALCHEMY_API_KEY,
    );
    this.tokenizedVoteFactory = new ethers.ContractFactory(
      tokenJson.abi,
      tokenJson.bytecode,
    );
    this.ballotContractFactory = new ethers.ContractFactory(
      ballotJson.abi,
      ballotJson.bytecode,
    );
    // replace with your connection method

    //  console.log(signer);
    //  console.log(this.tokenizedVote);
  }
  async getProposals() {
    const ballotContract = this.ballotContractFactory
      .attach(ballotAddress)
      .connect(this.provider);
    async function viewProposals(numberOfProposals: number) {
      const proposalNames = [];
      for (let i = 0; i <= numberOfProposals - 1; i++) {
        let proposalName = await ballotContract.proposals(i);
        proposalName = ethers.utils.parseBytes32String(proposalName.name);
        proposalNames.push(proposalName);
      }
      return proposalNames;
    }
    const proposals = viewProposals(3);
    return proposals;
  }
  getTokenAddress() {
    return tokenAddress;
  }
  async requestTokens(body: mintDto) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '');
    const signer = wallet.connect(this.provider);
    // define tokenizedVote
    const tokenizedVote = this.tokenizedVoteFactory
      .attach(tokenAddress)
      .connect(signer);
    // mint tokens here
    const formattedAmount = ethers.utils.parseEther(body.amount);
    const mintTokens = await tokenizedVote.mint(body.address, formattedAmount);
    // delegate tokens on ballot
    await mintTokens.wait();
    console.log(
      `${formattedAmount} Tokens minted successfully to ${body.address}, the transaction can be found at ${mintTokens}`,
    );
    const delegateTx = await tokenizedVote.delegate(body.address);
    await delegateTx.wait();
    return mintTokens.wait();
  }
}
