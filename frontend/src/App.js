import { useEffect, useState } from "react";
import { ethers } from "ethers";
import wavePortal from "./utils/WavePortal.json";
import logo from './logo.svg';
import './App.css';

function App() {

    /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveTotalCount, setWave] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  

  const contractAddress = "0xBe26aF2D8D842942A23552bCc57aF14CEE829712";
  const contractABI = wavePortal.abi;
  
  const { ethereum } = window;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  
  const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

  const checkWalletConnection = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
    } else {
        console.log("We have the ethereum object", ethereum);
      }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (message) => {
    try {

      if (ethereum) {
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      /*
      * Execute the actual wave from your smart contract
      */
      const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();

      console.log("Mined -- ", waveTxn.hash);

      count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      if (ethereum) {

        // Call the getAllWaves method from the Smart Contract
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        // Store the data in React useState
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const waveTotal = async () => {
    const data = await wavePortalContract.getTotalWaves();
      setWave(data.toNumber());
  }

  // Runs functions when the page loads
    useEffect( () => {
      let wavePortalContract;

      checkWalletConnection();
      waveTotal();

      const onNewWave = (from, timestamp, message) => {
        console.log("NewWave", from, timestamp, message);
        setAllWaves(prevState => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ]);
      };

      if (ethereum) {
        wavePortalContract.on("NewWave", onNewWave);
      }
      
      return () => {
        if (wavePortalContract) {
          wavePortalContract.off("NewWave", onNewWave);
        }
      };

    }, [])

  return (
    <div className="main__container">

      <div className="data__container">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          Hi my name is Noa and I think Web3 is way more interesting than studying
        </div>

        <div>
          <p>{ waveTotalCount }</p>
        </div>

        <textarea name="textbox" placeholder="" id="" cols="30" rows="10"></textarea>
        <button className="wave__button" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App;
