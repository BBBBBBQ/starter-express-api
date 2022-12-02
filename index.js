//これはpostToBot.js

//import express from "express";
//import axios from 'axios';


// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config(); //以下の process.env で環境変数を定義するための箱を作る

//process.env で必要な4項目　ボットID,ボットのトークン、ボットのパブリックキー、ディスコードのサーバーIDをセット
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 

//axios と express　がいるよと宣言
const axios = require('axios')
const express = require('express');

//ディスコードインタラクションがいるよと定義　⭕新しい情報
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

//expressで実行するものをapp.で書くことにするよ
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//ディスコードに作用させるためのAPIを取得している　使うときはawaitを前において確実に実行されるようにしている
const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});

//相対パス ('/post2D') を持つ HTTP POST リクエストがあるたびに呼び出されるコールバック関数を指定します。
app.post('/post2D', async (req,res) =>{
    
  let {embedmatelials} = req.body
    console.log("post2Dのリクエストが来たよ")
    const interaction = req.body;   //bodyの中身は、embの中身がくる req.body; 

    //console.log(interaction.title + "投稿します")

    //⭕embのところは、server.jsを参考に構成したからエラーになったら要注意
    let emb = {
        embeds: [{
          "title": `SALE`,
          "description": `${interaction.title}`,
          "fields": [
              {
                  "name": "Price",
                  "value": `${interaction.price} SOL`,
                  "inline": true
              },
              {
                  "name": "Date",
                  "value": `${interaction.date}`,
                  "inline": true
              },
              {
                  "name": "Explorer",
                  "value": `https://explorer.solana.com/tx/${interaction.signature}`
              }
          ],
          "image": {
              "url": `${interaction.imageURL}`,
          }
      }]	
    };

    console.log("リクエストの中身は→" + interaction.title)
    try
    {
    return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [{
              "title": `SALE`,
              "description": `${interaction.title}`,
              "fields": [
                  {
                      "name": "Price",
                      "value": `${interaction.price} SOL`,
                      "inline": true
                  },
                  {
                      "name": "Date",
                      "value": `${interaction.date}`,
                      "inline": true
                  },
                  {
                      "name": "Explorer",
                      "value": `https://explorer.solana.com/tx/${interaction.signature}`
                  }
              ],
              "image": {
                  "url": `${interaction.imageURL}`,
              }
          }]	
        },
      });

    }catch(e){    //だめならエラー出す
      console.error(e.code)
      console.error(e.response?.data)
      return res.send(`${e.code} error from discord`)
    }
  })

  app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Let us GOOOO!')
})

  //8999 番ポートでサーバーを起動しています。
app.listen(8999, () => {
  //app.listen(3000, () => {
  console.log("起動中")
})
