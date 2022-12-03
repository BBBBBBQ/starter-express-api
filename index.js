// sales_bot.js をベースに作る 
//PollingBot.js


//　/go　にアクセスしたら、実行される仕組みにする。
const express = require('express')
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})
app.get('/go', (req, res) => {
    console.log("Start Sales Bot")
    runSalesBot();
})
app.listen(process.env.PORT || 3000)



// const solanaWeb3 = require('@solana/web3.js');
// const { Connection, programs } = require('@metaplex/js');
const axios = require('axios');

// if (!process.env.PROJECT_ADDRESS || !process.env.DISCORD_URL) {
//     console.log("please set your environment variables!");
//     return;
// }

//const projectPubKey = new solanaWeb3.PublicKey(process.env.PROJECT_ADDRESS);
//const { metadata: { Metadata } } = programs;
const pollingInterval = 15000; // ms

//HE///
const DISCORD_Webhook = "https://discord.com/api/webhooks/1043483533714411561/wCAXzzQKzB3kjKOKpLYIjCi9xTmXw_6KzcD65cU3FRLFsR-JY9c-72zxAX2gNOZpweh4"
const apiURL = "https://api.helius.xyz/v0/addresses"
const address = "Fxjy8g9ABo8ZcZEh8B3M21fZdz8Sb56mVBpBznKynw6B" //ロイヤリティが入るのを入れる
const resource = "nft-events"
const options = `api-key=c4b5b565-3a26-45e2-b28c-e3c96cbae8c1&type=NFT_SALE` //APIキーを入れる
let mostRecentTxn = ""

//HE///

const runSalesBot = async () => {
    console.log("starting sales bot...");

    // let signatures;
    // let lastKnownSignature;
    // const options = {};
    while (true) {
        try 
        {
            let url = `${apiURL}/${address}/${resource}?${options}&until=${mostRecentTxn}`
            const { data } = await axios.get(url)

            // signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, options);
            if (!data.length) {
                console.log("polling...")
                await timer(pollingInterval);
                continue;
            }

            for (let i = data.length - 96; i >= 0; i--) {
                try {
                    // let { signature } = signatures[i];
                    // const txn = await solanaConnection.getTransaction(signature);
                    //console.log("いち")
                    const mintAD = data[i].nfts[0].mint //ミントアドレス
                    // const dateString = new Date(data[i].timestamp * 1000).toLocaleString();
                    if (mintAD) { 
                        console.log("に")
                        //continue; 
                    
                    const dateString = new Date(data[i].timestamp * 1000).toLocaleString();
                    const P_row = data[i].amount* 0.000000001 
                    const price = ((Math.round(P_row * 1000)) / 1000)//const price = Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL;
                    
                    // const accounts = txn.transaction.message.accountKeys;
                    // const marketplaceAccount = accounts[accounts.length - 1].toString();
    
                    // if (marketplaceMap[marketplaceAccount]) {
                    const metadata = await getMetadataME(mintAD);
                    if (!metadata) {
                            console.log("couldn't get metadata");
                            continue;
                        }
    
                    printSalesInfo(dateString, price, data[i].signature, metadata.name, data[i].source, metadata.image);
                    
                    var embMaterials = 
                        {
                            title: metadata.name,
                            price: price,
                            date: dateString,
                            signature: data[i].signature,
                            imageURL: metadata.image
                        }
                    
                    
                    // await postSaleToDiscord(metadata.name, price, dateString, signature, metadata.image)
                    //await axios.post('http://localhost:3000/post2D',embMaterials)
                    await axios.post('https://baby-blue-meerkat-tie.cyclic.app/post2D',embMaterials)
                    
                    console.log("さん")
                    console.log("embedの中身→→" + embMaterials.title + embMaterials.imageURL);
                    await timer(pollingInterval);
                    }

                } catch (err) {
                    console.log("error while going through signatures: ", err);
                    continue;
                }
            
    
                lastKnownSignature = data[i].signature;
                if (lastKnownSignature) {
                    mostRecentTxn = lastKnownSignature;
                }
            }

            } 
            
            catch (err) {
            console.log("error fetching data from wallet address: ", err);
            continue;
            }
       
        }
    }
//runSalesBot();

const printSalesInfo = (date, price, signature, title, marketplace, imageURL) => {
    console.log("-------------------------------------------")
    console.log(`Sale at ${date} ---> ${price} SOL`)
    console.log("Signature: ", signature)
    console.log("Name: ", title)
    console.log("Image: ", imageURL)
    console.log("Marketplace: ", marketplace)
}

const timer = ms => new Promise(res => setTimeout(res, ms))

const getMetadataME = async (tokenPubKey) => {        //tokenPubkey = 取引されたNFTのミントアドレス
    try {
        const { data } = await axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + tokenPubKey);   //{data}にいれる。GETする（MEのこのNFTについてのURL）の情報を｛配列｝として
        return data;                                                                                      //MEのAPIをaxios.getで叩いて、当該のNFTについてのメタ情報を"data"として返すよ。
    } catch (error) {
        console.log("error fetching MEmetadata: ", error)                 //もしTRYがうまく行かなければエラーメッセージを返す。
    }
}
