const TelegramBot = require('node-telegram-bot-api')
TOKEN = '524303186:AAEOmhUV6HOH2VfyIo0_Ca-_s4kGLkT_pew'
DB_URL = 'mongodb://localhost/TGBusers'
const mongoose = require('mongoose')
require('./user.model')
const User = mongoose.model('users')
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')
mongoose.connect(DB_URL).then(() => console.log('MongoDb Connected'))

var md5 = require('md5');
const merchId = 68539
const payCost = 5000
var isStart = false


bot = new TelegramBot(TOKEN, {
    polling: true
})


printNumbersInterval()
deleteDays()


bot.on('message', msg=> {
    const chatId = msg.chat.id
    const userId = msg.from.id






    User.findOne({telegramId: userId})
        .then(user => {
            //получили юзера с которым работаем!
            if (user) {
                //юзер есть уже


                if (user.isStartedRegistration === true) {
                    if (user.isFullRegistered === false) {
                        if (user.name) {
                            if (user.email) {
                            } else {
                                user.email = msg.text
                                user.isFullRegistered = true
                                user.save()
                                console.log('Email сохранен. Вы зареганы')
                                console.log(user)
                                bot.sendMessage(chatId, "Вы успешно зареганы!")

                       /////
//Это сейчас нам только помогает. В дальнейшем переменная меняется в php
                       User.findOne({telegramId: userId}).then(user => {
                           if(user.isBilaOlata === false) {
                               user.isBilaOlata = true
                               user.tempOplata = true
                               user.save()
                               console.log(user)
                           }
                       })
                       ///Создание ссылки оплаты
                       const zakazNumber = userId
                       const secWord = 'd0z9660n'
                       const createMD5 = md5 (merchId + ':' + payCost + ':' + secWord + zakazNumber)
                       const urlOplati = 'http://www.free-kassa.ru/merchant/cash.php' + '?' + 'm=' +
                           + merchId + '&' + "oa=" + payCost + '&' + "o=" + zakazNumber + '&' + "s=" + createMD5
//"ID Вашего магазина:Сумма платежа:Секретное слово:Номер заказа", пример
                                user.urlOplati = urlOplati
                                user.save()
                       bot.sendMessage(chatId, 'Оплатить: ', {
                           reply_markup: {
                               inline_keyboard : [
                                   [{
                                       text: 'Оплатить 500k',
                                       url: urlOplati
                                   }]
                               ]
                           }
                       })


                            }
                        } else {
// Файл пустой, начит пишем в него имя!
                            user.name = msg.text
                            user.save()
                            console.log('Имя сохранено. Впишите email')
                            bot.sendMessage(chatId, 'Введите email')

                        }
                    }
                } else {
                    console.log('Нет такого')
                }


                switch (msg.text){
                    case kb.firstQuest.soglasieOne:
                        bot.sendMessage(chatId, 'Тут вам еще вот инфа поъехала. Будете брать?', {
                            reply_markup: {
                                keyboard: keyboard.secondQuest
                            }
                        })
                        break
                    case kb.secondQuest.ostalVopr:
                        bot.sendMessage(chatId, 'Вот вам поддробные ответы на вопросики, что-то еще?')
                        break
                    case kb.secondQuest.opltatit:

                        bot.sendMessage(chatId, 'Отлично, давайте начинать. Ваш индентификатор: ' + userId, {
                            reply_markup: {
                                remove_keyboard: true
                            }

                        })


                        user.isStartedRegistration = true
                        user.save()
                        bot.sendMessage(chatId, 'Введите имя')

                        break
                }

                if (user.isBilaOlata === true){
// тут уже совершена оплата, замечательно. Тут принимаются сообщения от пользователей, которые оплатили
                    switch (msg.text) {
                        case "Привет":
                            bot.sendMessage(chatId, 'Привет андрей')
                            break
                        case "Накинь бабла":
                            user.days = user.days + 30
                            user.save()
                            bot.sendMessage(chatId, 'Пополнение совершено. На балансе ' + user.days)
                            break
                        case kb.gl.stat:
                            bot.sendMessage(chatId, 'Ваша стата:\n' +
                                'Ваш баланс :' + user.balance + '\nДней до следущей оплаты:' + user.days)
                            break
                        case kb.gl.chatenter:
                            bot.sendMessage(user.chatId, "Войди в чат, подними баблишко", {
                                reply_markup: {
                                    //Формирование ссылки на приват чат
                                    inline_keyboard: [
                                        [
                                            {
                                                text: 'Войти в чат',
                                                url: 'https://t.me/joinchat/AAAAAEqEGiRSzar_dYHRLQ'
                                            }
                                        ]
                                    ]
                                    //keyboard: keyboard.glMenu
                                }
                            })
                            break
                        case kb.gl.popolnSchet:
                            bot.sendMessage(chatId, 'Оплатить: ', {
                                reply_markup: {
                                    inline_keyboard : [
                                        [{
                                            text: 'Оплатить 500k',
                                            url: user.urlOplati
                                        }]
                                    ]
                                }
                            })
                            break
                        case kb.gl.refset:
                            var colvoref1
                            var colvoref2
                            var colvoref3
                            User.find({refer1: userId}).then(user => {
                                if(user.refer1){
                                    colvoref1 = user.length
                                } else {
                                    colvoref1 = 0
                                }


                            })
                            User.find({refer2: userId}).then(user => {
                                if(user.refer2){
                                    colvoref2 = user.length
                                } else {
                                    colvoref2 = 0
                                }

                            })
                            User.find({refer3: userId}).then(user => {
                                if(user.refer3){
                                    colvoref3 = user.length
                                } else {
                                    colvoref3 = 0
                                }

                            })

                            bot.sendMessage(chatId, 'Ваша реф сеть:\n Рефералов 1 уровня: ' + colvoref1 + "\n" +
                                "Рефералов 2 уровня: " + colvoref2 + "\nРефералов 3 уровня: " + colvoref3)

                            break
                        case kb.gl.refurl:
                            const reftempUr = 'https://telegram.me/TRBets_bot?start=' + userId
                            bot.sendMessage(chatId, 'Ваша реф ссылка. Все пользователи, которые по ней перейдут,' +
                                'автоматически закрепляются за вами: ' + reftempUr)
                            break
                        case kb.gl.spravka:
                            bot.sendMessage(chatId, 'Немного инфы по ставкам')
                            break
                        case kb.gl.support:
                            bot.sendMessage(chatId, 'Пишите этому челику')
                            break
                        case kb.gl.bettingKontora:
                            bot.sendMessage(chatId, 'Наша рефка беттинга')
                            break
                    }












                }

            }

        })

})




bot.onText(/\/start(.+)/, (msg, [source,match]) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    var refer = match.slice(1)
    isStart = true
    User.findOne({telegramId: userId})
        .then(user => {
            if (user) {
                if(user.isBilaOlata === true) {
                    bot.sendMessage(chatId, 'Рады снова видеть вас, оплативший!', {
                        reply_markup: {
                            keyboard: keyboard.glMenu
                        }
                    })
                } else {
                    //////////////////////
                    const text = 'Вы посмотрели видос?'

                    bot.sendMessage(chatId, text, {
                        reply_markup: {
                            keyboard: keyboard.firstQues
                        }
                    })
                }
            } else {
                //Реферальная система на четыре уровня
                user = new User({
                    telegramId: userId,
                    //тут сохраняем всех реферов в систему
                    refer1: refer,
                    chatId: chatId,
                    isBiloPriglashenie: false,
                    isBilaOlata: false
                })

                user.save()


                /////Доп условия

                User.findOne({telegramId: refer})
                    .then(refOne => {
                        if (refOne) {
                            //refer1
                            console.log(refOne.telegramId)
                            User.findOne({telegramId: refOne.refer1})
                                .then(refTwo =>{
                                    if(refTwo){
                                        console.log(refTwo.telegramId)
                                        user.refer2 = refTwo.telegramId
                                        user.save()
                                        /*
                                        User.findOne({telegramId: refTwo.refer1})
                                            .then(refTri =>{
                                                if(refTri) {
                                                    referTri = refTri.telegramId
                                                    User.findOne({telegramId: refTri.refer1})
                                                        .then(refFour => {
                                                            if(refFour) {
                                                                referFour = refFour.telegramId

                                                            }
                                                        })
                                                }
                                            })*/
                                        }
                                })
                        }
                    })





                //////////////////////
                const text = 'Вы посмотрели видос?'

                bot.sendMessage(chatId, text, {
                    reply_markup: {
                        keyboard: keyboard.firstQues
                    }
                })


            }
    })

})

bot.onText(/\/start/, msg => {
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (isStart === true){
        isStart = false
    } else {
        User.findOne({telegramId: userId})
            .then(user => {
                if (user) {
                    if(user.isBilaOlata === true) {
                        bot.sendMessage(chatId, 'Рады снова видеть вас, оплативший!', {
                            reply_markup: {
                                keyboard: keyboard.glMenu
                            }
                        })
                    } else {
                        //////////////////////
                        const text = 'Вы посмотрели видос?'

                        bot.sendMessage(chatId, text, {
                            reply_markup: {
                                keyboard: keyboard.firstQues
                            }
                        })
                    }
                } else {
                    //Реферальная система на четыре уровня
                    user = new User({
                        telegramId: userId,
                        //тут сохраняем всех реферов в систему
                        chatId: chatId,
                        isBiloPriglashenie: false,
                        isBilaOlata: false
                    })

                    user.save()


                    //////////////////////
                    const text = 'Вы посмотрели видос?'

                    bot.sendMessage(chatId, text, {
                        reply_markup: {
                            keyboard: keyboard.firstQues
                        }
                    })


                }
            })
    }



})



function printNumbersInterval() {
    var timerId = setInterval(function() {
// проверка на приглашение
        User.find({isBilaOlata: true, isBiloPriglashenie: false})
            .then(user => {
                user.forEach(user => {
                    if (user) {
                        user.isBiloPriglashenie = true
                        user.save()
                        bot.sendMessage(user.chatId, "Погнали, ты принят", {
                            reply_markup: {
                                //Формирование ссылки на приват чат
                                inline_keyboard: [
                                    [
                                        {
                                            text: 'Добавьтесь в группу',
                                            url: 'https://t.me/joinchat/AAAAAEqEGiRSzar_dYHRLQ'
                                        }
                                    ]
                                ]
                                //keyboard: keyboard.glMenu
                            }
                        })
                        bot.sendMessage(user.chatId, "Главное меню, будь здоров", {
                            reply_markup: {
                                keyboard: keyboard.glMenu
                            }
                        })
                    }
                })
            })

        // проверка на последующие оплаты
        //////////////////
        User.find({tempOplata:true})
            .then(user => {
                user.forEach(user => {
                    if (user) {
                        //поменять!!!!
                        user.days = user.days + 30
                        user.tempOplata = false
                        user.save()

//Отсылает деньги рефералам:
                        User.findOne({telegramId: user.refer1})
                            .then(referFirst =>{
                                if(referFirst) {
                                    bot.sendMessage(referFirst.chatId, 'Привет, у тебя реферал первого уровня!')
                                    referFirst.balance = referFirst.balance + 500
                                    referFirst.save()
                                    bot.sendMessage(referFirst.chatId, referFirst.balance)
                                }
                            })
                        User.findOne({telegramId: user.refer2})
                            .then(referSecond =>{
                                if(referSecond) {
                                    bot.sendMessage(referSecond.chatId, 'Привет, у тебя реферал второго уровня!')
                                    referSecond.balance = referSecond.balance + 250
                                    referSecond.save()
                                    bot.sendMessage(referSecond.chatId, referSecond.balance)
                                }
                            })
                        User.findOne({telegramId: user.refer3})
                            .then(referTri =>{
                                if(referTri) {
                                    bot.sendMessage(referTri.chatId, 'Привет, у тебя реферал третьего уровня!')
                                    referTri.balance = referTri.balance + 100
                                    referTri.save()
                                    bot.sendMessage(referTri.chatId, referTri.balance)
                                }
                            })



                    }
                })
            })
        ////////////////











    }, 5000);
}


function deleteDays() {
    var timerIdTwo = setInterval(function() {
        //вывести всех юзеров и вычесть из их user.days = user.days -1
        User.find({}).then(user => {
            if(user){
            user.forEach(user => {
                if(user.days > 0) {
                    user.days = user.days - 1
                    user.save()
                }
                console.log(user)
                /// Тут мы баним и разбаниваем
                //Если юзер оплатил когда то, и если его дни равны 0 и он не забанен
                // = бан, если же оплатил и не равны нулю, но забанен = разбан
                if (user.isBilaOlata === true) {
                    if (user.days === 0){
                        if (user.isBanned === false){
                            user.isBanned = true
                            user.save()
                            bot.sendMessage(user.chatId, 'Я вас баню!')
                        }
                    } else {
                        if(user.isBanned === true) {
                            user.isBanned = false
                            user.save()
                            bot.sendMessage(user.chatId, 'Я вас разбанил!')
                        }
                    }

                }

                ///

            })
            }
        })
    }, 10000)
}




//User.find().remove().then(users => console.log(users))
User.find().then(users => console.log(users))