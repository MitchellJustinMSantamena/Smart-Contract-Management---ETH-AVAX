import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState("");
  const [purchaseTimes, setPurchaseTimes] = useState([]);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const itemPrices = {
    "L'Homme Lacoste ": 3100,
    "Bvlgari Extreme": 1500,
    "Dior Sauvage": 3000,
    "Bleu de Chanel": 2500,
    "Ralph Lauren Polo Black ": 2400,
    "Creed Aventus": 1200,
    "Hugo Boss ": 1300,
    "Calvin Klein Eternity": 4500,
    "Jo Malone London": 5000,
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(10000);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(2000);
      await tx.wait();
      getBalance();
    }
  };

  const getAll = async () => {
    if (atm && balance !== undefined) {
      // Withdraw entire balance
      let tx = await atm.withdraw(balance);
      await tx.wait();
      getBalance();
    }
  };

  const buyPerfume = async () => {
    if (atm && selectedItem) {
      const price = itemPrices[selectedItem];
      if (balance >= price) {
        let tx = await atm.withdraw(price);
        await tx.wait();
        getBalance();
        setPurchaseTimes([...purchaseTimes, { time: new Date().toLocaleString(), item: selectedItem, price: price }]);
        setPurchaseSuccess(true);
        alert(`You have successfully bought ${selectedItem}`);
      } else {
        alert("Insufficient balance to buy this item.");
      }
    }
  };

  const canBuy = () => {
    const price = itemPrices[selectedItem];
    return balance !== undefined && selectedItem && price !== undefined
      ? balance >= price
        ? "You can buy this item"
        : "You cannot buy this item"
      : "";
  };

  const toggleShowPurchases = () => {
    setShowPurchases(!showPurchases);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Let's click proceed to Friday's Scents</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 10000 ETH</button>
        <button onClick={withdraw}>Withdraw 2000 ETH</button>
        <button onClick={getAll}>Gather all ETH</button>
        <div>
          <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
            <option disabled value="">Select item</option>
            {Object.keys(itemPrices).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          {selectedItem && (
            <div>
              <p>Price: {itemPrices[selectedItem]} ETH</p>
              <p>{canBuy()}</p>
              <button onClick={buyPerfume}>Buy Perfume</button>
              {purchaseSuccess && (
                <button onClick={toggleShowPurchases}>
                  {showPurchases ? "Hide Purchases" : "Show Purchases"}
                </button>
              )}
            </div>
          )}
        </div>
        {showPurchases && (
          <div>
            <h2>Purchases</h2>
            <ul className="purchase-times-list">
              {purchaseTimes.map((purchase, index) => (
                <li key={index}>
                  {`Time: ${purchase.time}, Item: ${purchase.item}, Price: ${purchase.price} ETH`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Friday's Scents</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-image: url(https://hips.hearstapps.com/toc.h-cdn.co/assets/16/31/1470426252-tcx090116lgopener001.jpg?resize=980:*);
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          padding: 50px;
        }
        header {
          
        .function-button {
          background-color: #4b9cd3;
          color: dark;
          border: none;
          padding: 100px 100px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
        }
        .function-button:hover {
          background-color: #357ab8;
        }
        select {
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
        p {
          color: #333;
        }
      `}
      </style>
    </main>
  )
}
