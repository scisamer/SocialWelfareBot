const { Context, session, Markup } = require('telegraf');
const tgresolve = require("tg-resolve");
const db = require('../database/db');
var fs = require("fs");
const request = require("request-promise");
const excelToJson = require('convert-excel-to-json');
const { MongoClient } = require('mongodb');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const uri = "mongodb+srv://samerjk23:49onPF2LOz6TI2RY@cluster0.amvgk1y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function command(ctx, next) {
    if (!ctx.message) return next();
    var text = ctx.message.text;
    var uid = ctx.message.from.id;

    if (!(ctx.session.isAdmin && ctx.session.cmd)) return next();

    var cmd = ctx.session.cmd;

    switch (cmd) {
        case 'sendtoall':
            var users = await db.users.asyncFind({});
            var blocked = 0;
            console.log(users);
            for (let i in users) {
                ctx.telegram.sendMessage(users[i].id, text).catch(err => {
                    console.log(`user bloked`);
                    blocked++;
                });
                await delay(100);
            }
            ctx.reply(`تم وصول الاذاعة الى {${users.length - blocked}} بنجاح
            عدد المحظورين: ${blocked}`);
            ctx.session.cmd = null;
            break;
        case 'add':
            // ================================= اذا مو ملف =============================== //
            if (!ctx.message.document) return ctx.reply(`لقد ارسلت رسالة نصية يجب عليك ارسال ملف (مستند) لترجمته`);
            console.log(ctx.message.document.mime_type);
            // ================================ اذا نوع الملف مو PDF ============================= //
            if (ctx.message.document.mime_type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                return ctx.reply(`لقد ارسلت ملف غير مدعوم، يمكنك حاليًا ترجمة ملفات excel فقط`);
            }
            const { message_id } = await ctx.reply(`يتم استيراد الملف، ...`);

            //===================== احضار رابط الملف من خلال الايدي =================================
            var url = await ctx.telegram.getFileLink(ctx.message.document.file_id);
            //=========================== احضار المف من خلال الرابط =================================
            const response = await request.get(url.href, { encoding: null });
            try {
                const result = excelToJson({
                    source: response,
                    header: {
                        rows: 1
                    },
                });
                let _newData = [];
                let newData = [];
                var type = ctx.session.cmdData;
                Object.keys(result).forEach(sheet => {
                    _newData = _newData.concat(result[sheet]);
                });

                await client.connect();
                console.log('Connected successfully to server');
                const mdb = client.db('allMeals');
                const users = mdb.collection('users');

                newData = _newData.map( key => {
                    let _A = key.A, // الاسم
                        _B = key.B, // اسم الام
                        _C = key.C, // تاريخ المراجعة
                        _D = key.D, // القسم
                        _E = key.E; // المحافظة
                    if (type == 2) {
                        key.C = _E;
                        key.D = _C;
                        key.E = _D;

                    }
                    else if (type == 3) {
                        key.A = _C;
                        key.B = _D;
                        key.C = _E;
                        key.D = _A;
                        key.E = _B;
                    }
                    return key;
                } )
                const insertResult = await users.insertMany(newData);
                // console.log('Inserted documents =>', insertResult);
                // await client.close();
                ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, `تم استيراد {${newData.length}} اسم بنجاح من الملف`);

            } catch (e) {
                ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, 'حدث خطأ ما!');
                throw e;
            }
            break;
        case 'setCh':

            ctx.session.cmd = null;
            break;

        default:
            next();
    }


};

module.exports = command;