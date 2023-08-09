// libs
const { Context, Telegraf, Markup } = require('telegraf');
const { session } = require('telegraf');
const db = require('../database/db');

async function channel(ctx, next) {
		if (!ctx.message) return next();
		var uid = ctx.message.from.id;
        if (ctx.session.isAdmin) return next();
        var checkif = await ctx.getChatMember(uid,-1836405779);
        if (checkif.status != "member") {
            ctx.reply(`يرجى الاشتراك في قناة البوت من اجل استخدامه
            @ffff
            قم بالاشتراك وارسل /start`);
        }
        else next();
}

module.exports = channel;