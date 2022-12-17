// sales_bot.js をベースに作る 
// PollingBot.js

//　/go　にアクセスしたら、実行される仕組みにする。
const express = require('express')
const app = express()
const axios = require('axios');

//HE///
const DISCORD_Webhook = "https://discord.com/api/webhooks/1043483533714411561/wCAXzzQKzB3kjKOKpLYIjCi9xTmXw_6KzcD65cU3FRLFsR-JY9c-72zxAX2gNOZpweh4"
const apiURL = "https://api.helius.xyz/v0/addresses"
const address = "Fxjy8g9ABo8ZcZEh8B3M21fZdz8Sb56mVBpBznKynw6B" //ロイヤリティが入るのを入れる
const resource = "nft-events"
const options = `api-key=c4b5b565-3a26-45e2-b28c-e3c96cbae8c1&type=NFT_SALE` //APIキーを入れる
let mostRecentTxn = ""
//HE///
const pollingInterval = 20000; // ms

app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})
app.get('/go', (req, res) => {
    console.log("Start Sales Bot")
    runSalesBot();
})
app.listen(process.env.PORT || 3000)

const runSalesBot = async () => {
    console.log("starting sales bot...");

    while (true) {
        try 
        {
            let url = `${apiURL}/${address}/${resource}?${options}&until=${mostRecentTxn}`
            const { data } = await axios.get(url)

            if (!data.length) {
                    console.log("polling...")
                    await timer(pollingInterval);
                    continue;

            } else {
                    for (let i = data.length - 96; i >= 0; i--) {
                        try {
                            const mintAD = data[i].nfts[0].mint //ミントアドレス
                            if (mintAD) { 
                            const dateString = new Date(data[i].timestamp * 1000).toLocaleString();
                            const P_row = data[i].amount* 0.000000001 
                            const price = ((Math.round(P_row * 1000)) / 1000)
                            const metadata = await getMetadataME(mintAD);
                            if (!metadata) {
                                    console.log("couldn't get metadata");
                                    await timer(pollingInterval);
                                    continue;
                                }
                            printSalesInfo(dateString, price, data[i].signature, metadata.name, data[i].source, metadata.image); //コンソールに投稿する予定の内容を出してあげる
                            var embMaterials = 
                                {
                                    title: metadata.name,
                                    price: price,
                                    date: dateString,
                                    signature: data[i].signature,
                                    imageURL: metadata.image
                                }
                            // await postSaleToDiscord(metadata.name, price, dateString, signature, metadata.image) //元のポスト用
                            //await axios.post('http://localhost:3000/post2D',embMaterials) //ローカルでテストする時用
                            await axios.post('https://baby-blue-meerkat-tie.cyclic.app/post2D',embMaterials)
                            console.log("embedの中身→→" + embMaterials.title + embMaterials.imageURL); //embMaterialsにちゃんと入っているかコンソールに出して確認する
                            await timer(pollingInterval);
                            }
                        }
                        catch (err) {
                            console.log("error while going through getMetadataME(mintAD)まわりのtryの中で", err);
                            continue;
                            } 
                        }
                    }
        }
        catch (err) {
                console.log("error while going through axios.get(url) ", err);
                continue;
            }

            lastKnownSignature = data[i].signature;
            if (lastKnownSignature) {
                    mostRecentTxn = lastKnownSignature;
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

const getMetadataME = async (tokenPubKey) => {                                                            //tokenPubkey = 取引されたNFTのミントアドレス
    try {
        const { data } = await axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + tokenPubKey);   //{data}にいれる。GETする（MEのこのNFTについてのURL）の情報を｛配列｝として
        return data;                                                                                      //MEのAPIをaxios.getで叩いて、当該のNFTについてのメタ情報を"data"として返すよ。
    } catch (error) {
        console.log("error fetching MEmetadata: ", error)
    }
}
