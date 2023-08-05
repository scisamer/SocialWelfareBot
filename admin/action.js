const { getRun, setRun } = require("../bot/startStop");
const { showAdminPanel, showAddData } = require("./adminpanel");
const db = require('../database/db');

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://samerjk23:49onPF2LOz6TI2RY@cluster0.amvgk1y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, retryWrites: false });


const { Markup } = require("telegraf");
module.exports = function onAction(bot) {
  bot.action('sendToAll', async (ctx) => {
    // رسالة البث المراد إرسالها إلى المشتركين
    ctx.session.cmd = 'sendtoall';
    ctx.reply(`اكتب رسالتك ليتم ارسالها الى جميع المشتركين`);
    showAdminPanel(ctx, "main", "des");
    return ctx.answerCbQuery(`اكتب رسالتم ليتم ارسالها الى جميع المشتركين`);
  });

  bot.action("runBot", async (ctx) => {
    var isRun = getRun();
    if (isRun) var msg = "تم ايقاف البوت";
    else var msg = "تم تفعيل البوت";
    setRun(!isRun);
    await ctx.answerCbQuery(msg);
    showAdminPanel(ctx, "main", "update");
  });

  bot.action("listAll", async (ctx, e) => {
    var users = await db.users.asyncFind({});
    var message = `عدد المشتركين الكلي: ${users.length}`;

    await ctx.answerCbQuery(message, { show_alert: true });
  });

  bot.action(/^addData:(\d+)$/, async (ctx) => {
    await ctx.reply("يرجى ارسال او تحويل ملفات الاكسل");
    showAddData(ctx);
    ctx.session.cmd = "add";
    ctx.session.cmdData = ctx.match[1];
  });

  bot.action("exitAddData", async (ctx, e) => {
    await ctx.answerCbQuery();
    showAdminPanel(ctx, "main", "update");
    ctx.session.cmd = null;
    ctx.session.cmdData = null;
  });
  bot.action("empty", async (ctx, e) => {
    await client.connect();
    console.log('Connected successfully to server');
    const mdb = client.db('allMeals');
    const users = mdb.collection('users');
    const result = await users.deleteMany({});
    await client.close();

    await ctx.answerCbQuery();
    ctx.reply("تم تفريغ الجدول بنجاح");
  });
  bot.action("setCh", async (ctx, e) => {
    ctx.session.cmd = "setCh";
    await ctx.answerCbQuery();
    ctx.reply(`ارسل رابط القناة`);
  });
}