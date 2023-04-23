const { expect } = require("chai");
const { ethers,tracer } = require("hardhat")



describe("Reentrancy test", () => {
  let accounts;
  let depositFundsContract, attackContract;
  
  before("deploy smart contract", async () => {
    await ethers.provider.send("evm_setAutomine", [false]);
    // console.log(await ethers.provider.getBlockNumber());
    accounts = await ethers.getSigners();
    const dep = await ethers.getContractFactory("DepositFundsPattern");
    depositFundsContract = await dep.connect(accounts[0]).deploy();
    await ethers.provider.send("evm_mine");
    await depositFundsContract.deployed(); 

    const attack = await ethers.getContractFactory("Attack");
    attackContract = await attack.connect(accounts[1]).deploy(depositFundsContract.address);
    await ethers.provider.send("evm_mine");
    await attackContract.deployed();
    // console.log(await ethers.provider.getBlockNumber());


  });
  it("",async()=>{
    console.log("\nDeposit 10 ETH into DepositFunds contract\n");
    await depositFundsContract.connect(accounts[0]).deposit({value:ethers.utils.parseEther('10','ether')});
    await ethers.provider.send("evm_mine")
    // console.log(await ethers.provider.getBlockNumber());
    let depositFundsContractBalance = await ethers.provider.getBalance(depositFundsContract.address);
    console.log("eth in depositFundsContract", ethers.utils.formatEther(depositFundsContractBalance) );
    let attackContractBalance = await ethers.provider.getBalance(attackContract.address);
    console.log("eth in attack", ethers.utils.formatEther(attackContractBalance) );

    console.log("\nRun attack function in Attack contract\n");
    await attackContract.connect(accounts[1]).attack({value:ethers.utils.parseEther("1","ether")});


    await ethers.provider.send("evm_mine");
    // console.log(await ethers.provider.getBlockNumber());
    depositFundsContractBalance = await ethers.provider.getBalance(depositFundsContract.address);
    console.log("eth in depositFundsContract after attack", ethers.utils.formatEther(depositFundsContractBalance) );
    attackContractBalance = await ethers.provider.getBalance(attackContract.address);
    console.log("eth in attackContract after attack", ethers.utils.formatEther(attackContractBalance) );
  });
});