import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const withdrawButton = document.getElementById("withdrawButton");
const getBalanceButton = document.getElementById("getBalanceButton");
const output = document.getElementById("output")

let walletConnect = false;

////////////////////////////////////////////////////////////////////////////

window.addEventListener('load', async() => {
    
        if (typeof window.ethereum !== 'undefined') { //if wallet exists 
            // Check if the user is currently connected to the wallet
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) { // check if it is connected or not
                connectButton.innerHTML = "Connected";
                connectButton.style.backgroundColor = "red";
                walletConnect = true;
            }
            })
            .catch(error => {
                // An error occurred while checking the connection status
                console.error('Error:', error);
            });
        }
        else{
            connectButton.innerHTML = "Connect Wallet";
            connectButton.style.backgroundColor = "white";
        }
    }
)

////////////////////////////////////////////


connectButton.onclick = async () => {
    if (typeof window.ethereum !== 'undefined' ) { //if wallet exist
        if(!walletConnect){//if it is not connected 
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                console.log(error);
            }
            connectButton.innerHTML = "Connected";
            connectButton.style.backgroundColor = "red";

        }
    } else {// if wallet not exists
        connectButton.innerHTML = "No wallet found!";
        connectButton.style.fontSize = "13px";
    }
};
///////////////////////////////////////////////////////
fundButton.onclick = async () => {
    const ethAmount = document.getElementById("input").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        if(walletConnect){
            //provide/ connection to blockchain
            //signer/wallet/ someone with some gas
    
            //contract that we are interacting with( ABI and contract address)
            const provider = new ethers.providers.Web3Provider(window.ethereum); //similar to jsonRPCProvider
            const signer = provider.getSigner(); // as we are connected to metamask so signer is one of those metamask accounts
            const contract = new ethers.Contract(contractAddress,abi, signer);
    
            try{
                const transactionResponse = await contract.fund({value: ethers.utils.parseEther(ethAmount),});
                //listen for the tx to be mined
                //listen for an event <- we havn't learned yet!->
                //hey, wait for this transaction to finish
                await listenFortransactionMine(transactionResponse,provider)
                console.log(`Funded ${ethAmount} Fake_ETH`); // 
                output.innerHTML = `Funded ${ethAmount} Fake_ETH`
            }
            catch(error){
                console.log(error);
            }
        }
        else{
            output.innerHTML = `Please connect wallet`
        }
    }
    else {
        output.innerHTML = "Please install MetaMask"
    }
};


//////////////////////////////////////////////////////////////////
withdrawButton.onclick = async () => {
    console.log("withdrawing...")
    if( typeof window.ethereum !== "undefined"){
        if(walletConnect){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', [])
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress,abi, signer);
            try{
                console.log("hhhh)")
                const transactionResponse = await contract.withdraw()
                await listenFortransactionMine(transactionResponse,provider)
            }
            catch(error){
                console.log(error)
            }
        }
        else{
            output.innerHTML = "Please connect wallet";
        }
    }
    else {
        output.innerHTML = "Please install MetaMask"
    }



};
///////////////////////////////////////////////////
getBalanceButton.onclick = async () => {
    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try{
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
            output.innerHTML=`Balance : ${ethers.utils.formatEther(balance)}`;
        }
        catch (error){
            console.log(error)
        }
    }
    else{
        output.innerHTML = "Please install MetaMask"
    }
};

///////////////////////////////////////////////////////////////////////////
function listenFortransactionMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash}...`)
    //create a  listner for the blockchain 
    // listen for this transaction to finish
    // provider.once(event, listener) // only one time
    return new Promise( (resolve,reject)=>{
        try{
            provider.once(transactionResponse.hash, (transactionReceipt)=>{
                console.log(`Completed with ${transactionReceipt.confirmations} block confirmations`)
                resolve();
            })
        }
        catch(error){
            reject(error);
        }
    })
}