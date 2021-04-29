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

  console.log("wallets created");

  // const signedTransferTx = {
  //   type: "Transfer",
  //   accountId: syncWallet.accountId, // id of the sender account in the zkSync
  //   from: syncWallet.address(),
  //   to: syncWallet2.address(),
  //   token: 0, // id of the ETH token
  //   amount: amount, // 1 Ether in Wei
  //   fee: ethers.utils.parseEther("0.001"),
  //   nonce: 0,
  //   // signature: {
  //   //   pubKey: "dead..", // hex encoded packed public key of signer (32 bytes)
  //   //   signature: "beef..", // hex encoded signature of the tx (64 bytes)
  //   // },
  // };

  const signedTransaction = await syncWallet.signSyncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
    fee: ethers.utils.parseEther("0.001"),
    nonce: await syncWallet.getNonce("committed"),
  });

  // const transactionHash = await syncProvider.submitTx(
  //   signedTransaction.tx,
  //   signedTransaction.ethereumSignature
  // );
  // console.log("transactionHash: ", transactionHash);

  console.log("submitting transaction...");
  const transfer = await zksync.wallet.submitSignedTransaction(
    signedTransaction,
    syncProvider
  );

  console.log("tracking transfer status...");
  const transferReceipt = await transfer.awaitReceipt();

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
