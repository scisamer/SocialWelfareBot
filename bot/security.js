// libs
const { Context, Telegraf, Markup } = require('telegraf');
const { session } = require('telegraf');
const db = require('../database/db');

async function security(ctx, next) {
	if (ctx.session == undefined) {
		ctx.session = {};
		if (!ctx.message) return next();
		var uid = ctx.message.from.id;

		var usr = await db.users.asyncFindOne({ id: uid });
		if (usr === null) {
			db.users.asyncInsert({ "id": uid, "group": "user" });
			ctx.session.group = "user";
			ctx.session.isAdmin = ctx.session.group == 'admin' || ctx.session.group == 'dev';
			ctx.session.isDev = ctx.session.group == 'dev';
		}
		else {
			ctx.session.group = usr.group;
			ctx.session.isAdmin = ctx.session.group == 'admin' || ctx.session.group == 'dev';
			ctx.session.isDev = ctx.session.group == 'dev';
		}

	}


	next();
}

module.exports = security;