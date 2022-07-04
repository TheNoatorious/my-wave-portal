const { hrtime } = require('process')

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    // compile the contract, files will show up in the artifacts dir
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // create local Ethereum network for this contract
    const waveContract = await waveContractFactory.deploy();
    // wait until the contract is deployed
    await waveContract.deployed();

    // give addy of the deployed contract
    console.log("Contract deployed to:", waveContract.address);
    // check the address of the person deploying our contract
    console.log("Contract deployed to:", owner.address);


    // manually call the functions as in a normal API
    let waveCount;
    waveCount = await waveContract.getTotalWaves();

    let waveTxn = await waveContract.wave();
    await waveTxn.wait();

    // check the count after you wave
    waveCount = await waveContract.getTotalWaves();

    // another person waves
    waveTxn = await waveContract.connect(randomPerson).wave();
    await waveTxn.wait();

    // check the count after random person waves
    waveCount = await waveContract.getTotalWaves();
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