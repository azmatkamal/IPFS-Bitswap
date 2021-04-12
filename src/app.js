const BigNumber = require("bignumber.js");
const axios = require("axios");
const ipfsAPI = require("ipfs-api");
const Excel = require("./exportData");

const initIPFSObject = async () => {
  return ipfsAPI("/ip4/127.0.0.1/tcp/5001");
};

const getStats = async (ipfs, time) => {
  const stats = await ipfs.bitswap.stat();

  const {
    dataReceived,
    blocksReceived,
    dupBlksReceived,
    dupDataReceived,
    blocksSent,
    dataSent,
    providesBufferLength,
    wantListLength,
    peerCount,
  } = stats;

  console.log("dataReceived: " + new BigNumber(dataReceived).toFixed());
  console.log("blocksReceived: " + new BigNumber(blocksReceived).toFixed());
  console.log("dupBlksReceived: " + new BigNumber(dupBlksReceived).toFixed());
  console.log("dupDataReceived: " + new BigNumber(dupDataReceived).toFixed());
  console.log("blocksSent: " + new BigNumber(blocksSent).toFixed());
  console.log("dataSent: " + new BigNumber(dataSent).toFixed());
  console.log(
    "providesBufferLength: " + new BigNumber(providesBufferLength).toFixed()
  );
  console.log("wantListLength: " + new BigNumber(wantListLength));
  console.log("peerCount: " + new BigNumber(peerCount).toFixed());

  const columns = [
    { header: "Data Received", key: "dataReceived" },
    { header: "Data Sent", key: "dataSent" },
    { header: "Blocks Received", key: "blocksReceived" },
    { header: "Blocks Sent", key: "blocksSent" },
  ];
  const data = [
    {
      dataReceived: new BigNumber(dataReceived).toFixed(),
      dataSent: new BigNumber(dataSent).toFixed(),
      blocksReceived: new BigNumber(blocksReceived).toFixed(),
      blocksSent: new BigNumber(blocksSent).toFixed(),
      // dupBlksReceived: new BigNumber(dupBlksReceived).toFixed(),
      // dupDataReceived: new BigNumber(dupDataReceived).toFixed(),
      // providesBufferLength: new BigNumber(providesBufferLength).toFixed(),
      // wantListLength: new BigNumber(wantListLength),
      // peerCount: new BigNumber(peerCount).toFixed(),
    },
  ];

  Excel.exportData(columns, data, `${time}-IPFS-Stats`);

  return stats;
};

const getPeerLedger = async (peer, ignoreUnwantedPeers = false) => {
  try {
    const res = await axios.post(
      `http://127.0.0.1:5001/api/v0/bitswap/ledger?arg=${peer}`
    );
    const { data } = res;

    if (data) {
      const { Peer, Value, Sent, Recv, Exchanged } = data;

      if (ignoreUnwantedPeers) {
        if (Value !== 0 || Sent !== 0 || Recv !== 0 || Exchanged !== 0) {
          console.log("Peer ID: " + Peer);
          console.log("  Value: " + Value);
          console.log("  Data Sent: " + Sent);
          console.log("  Data Received: " + Recv);
          console.log("  Data Exchanged: " + Exchanged);

          return {
            peerid: Peer,
            val: Value,
            sent: Sent,
            rec: Recv,
            exch: Exchanged,
          };
        }
      } else {
        console.log("Peer ID: " + Peer);
        console.log("  Value: " + Value);
        console.log("  Data Sent: " + Sent);
        console.log("  Data Received: " + Recv);
        console.log("  Data Exchanged: " + Exchanged);
        return data;
      }
    } else {
      console.log("Unable to fetch Peer Ledger");
    }
  } catch (e) {
    console.log(e);
  }

  return null;
};

const getWantList = async (ipfs, time) => {
  const list = await ipfs.bitswap.wantlist();

  let keys = [];
  if (list && list.Keys) keys = list.Keys;

  let returnList = [];

  for (let i = 0; i < keys.length; i++) {
    const item = keys[i];
    let cid = Object.values(item);
    if (cid && cid.length) cid = cid[0];
    console.log(`CID: ${cid}`);

    returnList.push(cid);
  }

  const columns = [{ header: "Want List", key: "wantlist" }];
  const data = returnList.map((i) => {
    return { wantlist: i };
  });

  Excel.exportData(columns, data, `${time}-IPFS-WantList`);

  return returnList;
};

const getBlockStats = async (ipfs, cid) => {
  try {
    const stats = await ipfs.block.stat(cid);
    console.log("Block Stats: ID => " + cid + "    Size => " + stats.size);
    return {
      cid,
      size: stats.size,
    };
  } catch (e) {
    console.log(e);
  }
  return null;
};

module.exports = {
  getBlockStats,
  getWantList,
  getPeerLedger,
  getStats,
  initIPFSObject,
};
