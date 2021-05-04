const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;
const privateKey2 = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

const main = async () => {
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  // wallet
  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  // wallet2
  const ethWallet2 = new ethers.Wallet(privateKey2, ethersProvider);
  const syncWallet2 = await zksync.Wallet.fromEthSigner(
    ethWallet2,
    syncProvider
  );

  console.log("wallet address: ", syncWallet.address());
  console.log("wallet2 address: ", syncWallet2.address());

  // wallet
  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "wallet committed: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  // wallet
  const verifiedETHBalance = await syncWallet.getBalance("ETH", "verified");
  console.log("wallet verified", ethers.utils.formatEther(verifiedETHBalance));

  console.log();
  // wallet2
  const committedETHBalance2 = await syncWallet2.getBalance("ETH");
  console.log(
    "wallet2 committed: ",
    ethers.utils.formatEther(committedETHBalance2)
  );

  // wallet2
  const verifiedETHBalance2 = await syncWallet2.getBalance("ETH", "verified");
  console.log(
    "wallet2 verified",
    ethers.utils.formatEther(verifiedETHBalance2)
  );
};

main();
