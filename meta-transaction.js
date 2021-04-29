const ethers = require("ethers");
const zksync = require("zksync");
const { utils, BigNumber } = ethers;
const { formatEther } = utils;
const { wallet } = zksync;
const { submitSignedTransactionsBatch } = wallet;

require("dotenv").config();

// transfer 0.001, 0.002, and 0.001 ETH simultaneously from wallet to wallet2
// tx1 and tx2 do not need gas fee which is paid by tx3

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

  const fee = await syncProvider.getTransactionsBatchFee(
    ["Transfer", "Transfer", "Transfer"],
    [syncWallet2.address(), syncWallet2.address(), syncWallet2.address()],
    "ETH"
  );

  console.log("total fee: ", formatEther(fee));

  const nonce = await syncWallet.getNonce();

  const tx1 = await syncWallet.signSyncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
    fee: BigNumber.from("0"),
    nonce: nonce,
  });

  const tx2 = await syncWallet.signSyncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.002"),
    fee: BigNumber.from("0"),
    nonce: nonce + 1,
  });

  const tx3 = await syncWallet.signSyncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
    fee: fee,
    nonce: nonce + 2,
  });

  const batchTxs = await submitSignedTransactionsBatch(syncProvider, [
    tx1,
    tx2,
    tx3,
  ]);

  console.log("tracking transactions status...");

  for (let i = 0; i < batchTxs.length; i++) {
    await batchTxs[i].awaitReceipt();
    console.log(`tx${i} committed`);
  }

  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "wallet 1 committed balance: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const committedETHBalance2 = await syncWallet2.getBalance("ETH");
  console.log(
    "wallet 2 committed balance: ",
    ethers.utils.formatEther(committedETHBalance2)
  );
};

main();
