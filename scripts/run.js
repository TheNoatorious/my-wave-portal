const { hrtime } = require('process')

const main = async () => {
    // compile the contract, files will show up in the artifacts dir
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // create local Ethereum network for this contract
    const waveContract = await waveContractFactory.deploy();
    // wait until the contract is deployed
    await waveContract.deployed();

    // give addy of the deployed contract
    console.log("Contract deployed to:", waveContract.address);

    // manually call the functions as in a normal API
    let waveCount;
    waveCount = await waveContract.getTotalWaves();

    console.log("Number of waves: ", waveCount.toNumber());

    let waveTxn = await waveContract.wave("A message!");
    await waveTxn.wait(); // wait for the transaction to be mined

    const [_, randomPerson] = await hre.ethers.getSigners();
    waveTxn = await waveContract.connect(randomPerson).wave("Another message!");
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