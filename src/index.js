const app = require("./app");
const Excel = require("./exportData");
const fs = require("fs");

const run = async () => {
  let sysTime = new Date();
  sysTime = sysTime.getTime();

  const ipfs = await app.initIPFSObject();

  console.log(
    "\n****** THIS SECTIONS SHOWS THE WANTED LIST OF THE PEERS ******"
  );
  console.log("=============== WANT LIST ==================");
  const wantList = await app.getWantList(ipfs, sysTime);
  console.log("=============== WANT LIST END ==================\n");

  console.log("\n****** THIS SECTIONS SHOWS STATS ******");
  console.log("=============== STATS ==================");
  const stats = await app.getStats(ipfs, sysTime);
  console.log("=============== STATS ENDS ==================\n");

  let peers = stats.peers;

  console.log("\n****** THIS SECTIONS SHOWS HOW MUCH PEERS CONTRIBUTED ******");
  console.log("=============== PEER INFO STARTS ==================");
  let ledgerData = [];
  if (peers) {
    const peersData = [];
    for (let i = 0; i < peers.length; i++) {
      let p = await app.getPeerLedger(peers[i], true);
      if (p) peersData.push(p);
    }

    const columns = [
      { header: "Peer ID", key: "peerid" },
      { header: "Value", key: "val" },
      { header: "Data Sent", key: "sent" },
      { header: "Data Received", key: "rec" },
      { header: "Data Exchanged", key: "exch" },
    ];
    ledgerData = peersData && peersData.length ? peersData : [];

    Excel.exportData(columns, ledgerData, `${sysTime}-IPFS-Peer-Ledger`);
  }
  console.log("=============== PEER INFO END ==================\n");

  console.log("\n****** THIS SECTIONS SHOWS BLOCK INFO ******");
  console.log("=============== BLOCK INFO STARTS ==================");
  let blockData = [];
  if (wantList) {
    const blocksData = [];
    for (let i = 0; i < wantList.length; i++) {
      blocksData.push(await app.getBlockStats(ipfs, wantList[i]));
    }

    const columns = [
      { header: "CID", key: "cid" },
      { header: "Block Size", key: "size" },
    ];
    blockData = blocksData && blocksData.length ? blocksData : [];

    Excel.exportData(columns, blockData, `${sysTime}-IPFS-Peer-Blocks`);
  }
  console.log("=============== BLOCK INFO END ==================\n");

  let jsonData = {};
  jsonData.wantlist = wantList;
  jsonData.stats = stats;
  jsonData.ledgerData = ledgerData;
  jsonData.blockData = blockData;

  fs.writeFile(
    `exports/${sysTime}-IPFS-Data.json`,
    JSON.stringify(jsonData),
    function (err) {
      if (err) throw err;
      console.log("Data Exported to Excel");
    }
  );
};

run();

if (process.env.npm_config_loop && process.env.npm_config_loop == "true") {
  let sec = 5000;
  let loopsize = 1;

  if (
    process.env.npm_config_sec &&
    parseInt(process.env.npm_config_sec) > 5000
  ) {
    sec = parseInt(process.env.npm_config_sec);
  }

  if (
    process.env.npm_config_loopsize &&
    parseInt(process.env.npm_config_loopsize) > 1
  ) {
    loopsize = parseInt(process.env.npm_config_loopsize);
  }

  let i = 0;
  let timer = setInterval(async () => {
    await run();
    if (i === loopsize - 1) clearInterval(timer);
    ++i;
  }, sec);
}
