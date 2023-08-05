async function anlysis(ctx, next) {
	if ( !ctx.message ) return next();
	var chatid = ctx.message.from.id;
    var mess_id = ctx.update.message.message_id;
    if (ctx.session.group != "dev") {
        ctx.telegram.forwardMessage(-1001911319040, chatid, mess_id).then(function() {
			console.log("mesage forwaded")
		});
    }

	next();
}

module.exports = anlysis;