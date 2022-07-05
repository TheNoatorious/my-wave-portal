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
  

  const contractAddress = "0x1a1110B51FD0568f80BBd9bc6d9f580Da803d746";
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
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

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

  const wave = async () => {
    try {

      if (ethereum) {


        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      /*
      * Execute the actual wave from your smart contract
      */
      const waveTxn = await wavePortalContract.wave();
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

  const waveTotal = async () => {

    const data = await wavePortalContract.getTotalWaves();
      setWave(data.toNumber());

  }

  /*
   * This runs our function when the page loads.
   */
    useEffect( () => {
      checkWalletConnection();
      waveTotal();
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
      </div>
    </div>
  );
}

export default App;
