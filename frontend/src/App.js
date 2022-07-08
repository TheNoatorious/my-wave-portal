import { useEffect, useState } from "react";
import { ethers } from "ethers";
import wavePortal from "./utils/WavePortal.json";
import logo from './logo.svg';
import './App.scss';
import './assets/scss/style.scss';

function App() {

    /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0xA0D8fEB6d62f92D3deeF0EE4d08fb25EBDD22bc8";
  const contractABI = wavePortal.abi;
  
  const { ethereum } = window;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  
  const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  const textarea = document.getElementById('textbox');

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
      getAllWaves();
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

      setMessage("");

      console.log("Mining...", waveTxn.hash);
      await waveTxn.wait();

      console.log("Mined -- ", waveTxn.hash);


      count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
    
      getAllWaves();
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

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves((prevState) => [
        ...prevState,
        {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
        },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (textarea.value === "") {
      document.getElementsByClassName("input-container")[0].setAttribute("data-error", "Message can not be empty ):");
      console.log("Message cannot be empty")
    } else {
      document.getElementsByClassName("input-container")[0].removeAttribute("data-error");
      setMessage(e.target.value);
      wave(message);
    }
  }

  // Runs functions when the page loads
    useEffect(() => {
      checkWalletConnection();
    }, []);

    useEffect(() => {
        let wavePortalContract;

        if (window.ethereum) {
            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, []);

  return (
    <div className="content">
      <header>
        <div className="container">
          <nav>
            <div className="logo">My Wave Portal</div>
            <ul className="nav__items">
              <li className="nav__item"><a href="https://twitter.com/thenoatorious" target="_blank" rel="noreferrer" className="icon--round" title="Twitter"><span className="icon icon--twitter"></span></a></li>
              <li className="nav__item"><a href="https://goerli.etherscan.io/address/0xA0D8fEB6d62f92D3deeF0EE4d08fb25EBDD22bc8" target="_blank" rel="noreferrer" className="icon--round" title="Etherscan"><span className="icon icon--etherscan"></span></a></li>
              <li className="nav__item">            
                {
                 /*
                  * If there is no currentAccount render this button
                  */
                }
                {!currentAccount
                  ? <div className="btn btn--secondary" onClick={connectWallet}><span className="icon icon--red">&bull;</span>Connect Wallet</div>
                  : <div className="btn btn--secondary"><span className="icon icon--green">&bull;</span>Connected</div>
                }
              </li>
            </ul>


          </nav>
      
          </div>
      </header>
        <div className="wave">
          <div className="wave__container">
            <div className="wave__content">
              <div className="wave__header">
                <h1 className="wave__title">👋 Hey there!</h1>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="form__header">
                  Wave if you think Web3 is awesome
                </div>

                <div className="form__inner">
                <div className="input-container">
                  <textarea 
                    name="textbox"
                    className="form__textarea"
                    id="textbox" 
                    placeholder="Type your message" 
                    cols="30" 
                    rows="10" 
                    value={message} 
                    onChange={(e) => { setMessage(e.target.value) }}
                  />
                </div>
                <input type="submit" value="Wave" className="form__submit" />
                </div>
              </form>
            </div>
          </div>
          <div className="cards">
          
            {allWaves.slice(0).reverse().map((wave, index) => {
              return (
                
                <div key={index} className="card">
                  <h3 className="card__message">{wave.message}</h3>
                  <div className="card__footer">
                    <div className="card__address">From: {wave.address}</div>
                    <div className="card__date">Time: {wave.timestamp.toString()}</div>
                  </div>
                </div>
                )
            })}
            
          </div>
        </div>

    </div>
  );
}

export default App;
