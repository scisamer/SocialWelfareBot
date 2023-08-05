// libs
const { Context, Telegraf, Markup, session, } = require('telegraf');
const { Keyboard } = require('telegram-keyboard');
var fs = require("fs");
const db = require('./database/db');

// vars
const admin = require('./admin/admin');
const base = require('./bot/base');
const security = require('./bot/security');
const onAction = require('./admin/action');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf('6236812837:AAFruHisHmfVvgGHIZEJJiQ6iLc5UYMmUQE');


bot.use(session());

// bot.use(ctx => {
// 	fs.writeFileSync( './results.json', JSON.stringify( ctx, null, 4 ), 'UTF-8' );
// })

// نقطة امان
bot.use( security );
bot.use( require("./bot/anlysis") );
//ملفات الاضافات
bot.use( require("./bot/channel") );
bot.use( admin );
bot.use( require("./bot/command") );
onAction(bot);
bot.use( base );

//================  Admin Conpnel ======================
bot.launch();