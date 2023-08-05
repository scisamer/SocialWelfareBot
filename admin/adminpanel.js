const { Markup } = require("telegraf");
const { getRun } = require("../bot/startStop");
async function showAdminPanel(ctx, path, type) {
    var s = getRun() ? "نشط ✅" : "معطل ❌";
    const broadcastButtons = [
        [
            Markup.button.callback('1 اضافة ملفات اكسل', 'addData:1'),
            Markup.button.callback('2 اضافة ملفات اكسل', 'addData:2')
        ],

        [
            Markup.button.callback('3 اضافة ملفات اكسل', 'addData:3'),
            // Markup.button.callback('4 اضافة ملفات اكسل', 'addData:4')
        ],

        [Markup.button.callback('تفريغ من جميع الملفات', 'empty')],
        [
            Markup.button.callback(`حالة البوت ${s}`, 'runBot'),
            Markup.button.callback('اذاعة رسالة', 'sendToAll'),
        ],
        [
            Markup.button.callback('عدد المشركين', 'listAll'),
            // Markup.button.callback('تغيير القناة', 'setCh'),
        ]
    ].map(k => k.reverse());
    const keyboard = Markup.inlineKeyboard(broadcastButtons);
    if (type == "update") {
        await ctx.editMessageReplyMarkup({ inline_keyboard: broadcastButtons });
    } else if (type == "des") {
        // await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.deleteMessage();
    }
    else {
        await ctx.reply('أهلاً بك! اضغط على زر "إرسال رسالة بث"المشتركين.', keyboard);
    }
}

async function showAddData(ctx) {
    const broadcastButtons = [
        [
            Markup.button.callback('الخروج من وضع ادخال البيانات', 'exitAddData'),
        ],
    ].map(k => k.reverse());
    const keyboard = Markup.inlineKeyboard(broadcastButtons);
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: broadcastButtons });
}

module.exports = { showAdminPanel, showAddData };