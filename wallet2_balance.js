const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

const main = async () => {
  const privateKey = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

  console.log("waiting for get zksync provider...");
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);

  console.log("waiting for derive zksync signer...");
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "committed balance: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const verifiedETHBalance = await syncWallet.getBalance("ETH", "verified");
  console.log(
    "verified balance: ",
    ethers.utils.formatEther(verifiedETHBalance)
  );
};

main();
