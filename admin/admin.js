const { Context, session, Markup } = require('telegraf');
const tgresolve = require("tg-resolve");
const RandExp = require('randexp');

var fs = require("fs");

const {showAdminPanel} = require("./adminpanel");
const db = require('../database/db');



async function admin(ctx, next) {
	if (!ctx.message) return next();
	var text = ctx.message.text;
	var uid = ctx.message.from.id;

	if (ctx.session.isAdmin) {

		// ----------------- Admin Panel ---------------------
		const reply = async (text, keyboard) => {
			ctx.session.cmd = null;
			return await ctx.reply(text, keyboard);
		}
		var replyWithHTML = async text => {
			ctx.session.cmd = null;
			return await ctx.replyWithHTML(text);
		}
		if (text == "/start") {
			ctx.session.cmd = null;
			showAdminPanel(ctx, "main");
		}
		//-----------------------------------------------------
		if (text == "/genCode") {
			if (!ctx.session.isDev) return reply(`تم رفض التصريح`);
			var genCode = new RandExp(/[a-zA-Z\d_]{32}/).gen();
			replyWithHTML(`Your Code is: <b>${genCode}</b>`);
			await db.adminCodes.asyncInsert({ "generator": genCode, active: true });

		}
		else next();
	} else {
		var code = await db.adminCodes.asyncFindOne({ generator: text });
		if (code !== null) {
			if (code.active === false) return ctx.reply(`الكود تم استخدامه مسبقًا`);
			await db.adminCodes.asyncUpdate({ generator: text }, { $set: { active: false } });

			db.users.asyncInsert({ "id": uid, "group": "admin" });

			ctx.reply("تم تفعيل البوت بنجاح");

		} else next();
	}




}



module.exports = admin;