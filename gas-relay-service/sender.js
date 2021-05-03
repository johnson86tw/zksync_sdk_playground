const ethers = require("ethers");
const zksync = require("zksync");
const axios = require("axios");
require("dotenv").config();
const { utils, BigNumber } = ethers;
const { formatEther } = utils;
const { wallet } = zksync;
const { submitSignedTransactionsBatch } = wallet;

const privateKey2 = process.env.ZKSYNC_DEV2_PRIVATE_KEY;
const walletAddress = "0x9e8f8C3Ad87dBE7ACFFC5f5800e7433c8dF409F2";

(async () => {
  const wallet2 = await setupWallet();
  const tx = await signTransaction(wallet2);

  try {
    await axios.post("http://localhost:3000/order", {
      id: 42,
      transaction: tx,
    });
  } catch (e) {
    throw new Error(e);
  }
})();

async function setupWallet() {
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  // wallet2
  const ethWallet2 = new ethers.Wallet(privateKey2, ethersProvider);
  const syncWallet2 = await zksync.Wallet.fromEthSigner(
    ethWallet2,
    syncProvider
  );
  return syncWallet2;
}

async function signTransaction(syncWallet2) {
  // wallet 2 signed transaction
  const tx = await syncWallet2.signSyncTransfer({
    to: walletAddress,
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
    fee: BigNumber.from("0"),
    nonce: await syncWallet2.getNonce(),
  });

  return tx;
}
