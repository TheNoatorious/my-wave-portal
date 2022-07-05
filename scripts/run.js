const { hrtime } = require('process')

const main = async () => {
    // compile the contract, files will show up in the artifacts dir
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // create local Ethereum network for this contract
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    // wait until the contract is deployed
    await waveContract.deployed();

    // give addy of the deployed contract
    console.log("Contract deployed to:", waveContract.address);

   /*
    * Get Contract balance
    */
    let contractBalance = await hre.ethers.provider.getBalance(
        waveContract.address
    );
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    // manually call the functions as in a normal API
    let waveCount;
    waveCount = await waveContract.getTotalWaves();

    console.log("Number of waves: ", waveCount.toNumber());

   /*
    * Send two Waves
    */
   const waveTxn = await waveContract.wave("This is wave #1");
   await waveTxn.wait();
 
   const waveTxn2 = await waveContract.wave("This is wave #2");
   await waveTxn2.wait();

   /*
    * Get Contract balance to see what happened!
    */
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

   /*
    * Send message
    */
    // const [_, randomPerson] = await hre.ethers.getSigners();
    // waveTxn = await waveContract.connect(randomPerson).wave("Another message!");
    await waveTxn.wait(); // Wait for the transaction to be mined
  
    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
};

const runMain = async() => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();