const fs = require("fs");
const db = require('../database/db');
const { getRun } = require("./startStop");

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://samerjk23:49onPF2LOz6TI2RY@cluster0.amvgk1y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	retryWrites: false,
	connectTimeoutMS: 5000,
});

// (async function (params) {
// 	try {
// 	await client.connect();
// 	console.log('Connected successfully to server');
// 	const mdb = client.db('allMeals');
// 	const users = mdb.collection('users');

// 	   // خطوة 1: استعلام للعثور على العناصر المتكررة
// 	   const duplicateUsers = await users.aggregate([
// 		{
// 		  $group: {
// 			_id: { A: '$A', B: '$B', C: '$C', D: '$D' },
// 			count: { $sum: 1 }
// 		  }
// 		},
// 		{ $match: { count: { $gt: 1 } } }
// 	  ]).toArray();

// 	  console.log(`${duplicateUsers.length} found!`);

// 	  const bulkOps = duplicateUsers.map(duplicate => ({
// 		deleteMany: {
// 		  filter: { A: duplicate._id.A, B: duplicate._id.B, C: duplicate._id.C, D: duplicate._id.D }
// 		}
// 	  }));

// 	  await users.bulkWrite(bulkOps);
// 	  console.log(`Deleted duplicate users in parallel.`);



// 	} catch (err) {
// 		console.log('Error: ', err);
// 	  } finally {
// 		// تأكد من إغلاق الاتصال بقاعدة البيانات بغض النظر عن النتيجة
// 		await client.close();
// 		console.log('Connection closed.');
// 	  }


// })();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function base(ctx, next) {
	if (!ctx.message) return next();
	var text = ctx.message.text;
	var uid = ctx.message.from.id;
	if (getRun() === false) return next();

	if (text == "/help") return ctx.reply(`
	طريقة استخدام البوت:
	اكتب اسمك فقط وعلى الاقل الاسم الثلاثي،
	مثال: محمد علي قاسم
	وستظهر لك كل النتائج خلال لحضات
	`);

	if (text == "/start") {
		return ctx.reply(`مرحبا بك في بوت اسماء المشمولين في الرعاية الاجتماعية

		ابدأ الآن بارسال اسمك الثلاثي! 💫🚀`);
	}

	else {
		if (!text) return ctx.reply("يرجى ارسال اسم وليس صورة او ملف");
		text = text.replace(/(\s+)/g, " ")
			.replace(/^أ/gm, 'ا')
			.replace(/ة(?=\s|$)/g, 'ه')
			.trim();
		if (/^(?:[\u0600-\u06FF]+\s){2,}[\u0600-\u06FF]+$/.test(text)) {
			let editMessage = await ctx.replyWithMarkdown(`جاري البحث عن {*${text}*}`);
			await client.connect();
			console.log('Connected successfully to server');
			const mdb = client.db('allMeals');
			const users = mdb.collection('users');

			var findResult = await users
				.find({ A: { $regex: text, $options: 'i' } })
				.toArray();
			await client.close();
			ctx.telegram.editMessageText(ctx.chat.id, editMessage.message_id, 0, `اكتملت عملية البحث`);
			if (findResult.length > 0) {
				const subArrays = [];
				// تقسيم المصفوفة الأساسية إلى مصفوفات فرعية
				for (let i = 0; i < findResult.length; i += 15) {
					const subArray = findResult.slice(i, i + 15);
					subArrays.push(subArray);
				}

				subArrays.forEach(findResults => {
					for (var user of findResults) {
						var message = "";
						var txt = `الاسم: ${user.A}\nاسم الام: ${user.B}\nتاريخ المراجعة: ${user.C}\nالقسم: ${user.D}`;
						message += txt;
					}
					ctx.reply(message);
				})

			} else {
				ctx.reply("لا يوجد نتائج، يرجى انتظار نشر وجبات جديدة");
			}
		} else {
			ctx.reply("يرجى ادخال الاسم الثلاثي بشكل صحيح");
		}

	}
	return next();
}

module.exports = base;