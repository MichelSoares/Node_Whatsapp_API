import { MessageMedia, Location } from "whatsapp-web.js";
import { client, account_broker, chatsGroups } from "../app";
import { Message } from "../Interfaces/Message";
import { logger } from '../helper/default.logger';
import { makeRequestAPI } from "./makeRequestAPI";
const { addNovoNumero, consultarTodosNumeros, atualizarNumero, consultarPorNumero, excluirTodosNumeros } = require('../dblite');
const { generateUUID } = require('../util')
const dayjs = require('dayjs');


process.on("SIGINT", async () => {
    logger.info("(SIGINT) ENCERRANDO O APP...");
    await client.destroy();
    process.exit(0);
  })


class MessageServices {

    async execute(text_: string, dst: string, file: string, id_omni_channel: string, latitude: string, longitude: string, description: string) 
    {

       try{ 
            let sendMessage;
            let number = dst;
            const text = text_;
            let chatId;
            //number = '+5541999697330'
            //excluirTodosNumeros();
            //consultarTodosNumeros();
            //VERIFICA se a msg não é de grupo! visto que um grupo tem o seguinte ID: 120363142522203560@g.us e um número de conversa individual: +5511999998887

            //logger.info(`DST informado para envio: ${number}`)
            //logger.info(`MESAGEM é de grupo? chatGroups: ${JSON.stringify(chatsGroups)}`)

            let numeroBr = number.substring(0,3)
            if(numeroBr === '+55' && number.length <= 14 && !number.includes('@')){ // verificando se a msg é de conversa INDIVIDUAL ou GRUPO!
                let contactId;
                let ret = await consultarPorNumero(number.replace("+",""));

                if(ret !== null && ret !== "")
                {
                    //logger.info(`Número: ${number.replace("+","")} existe no banco de dados.`)
                    let retJson = JSON.parse(ret);
                    number = '+' + retJson[0].num_perfil_whatsapp;
                } 
                else
                {
                    logger.info(`Número: ${number.replace("+","")} não existe no banco de dados. Verificando na META.`)
                    contactId = await client.getNumberId(number.replace("+",""));
                    if(contactId !== null)
                    {
                        addNovoNumero(number.replace("+",""), contactId.user, dayjs().format('DD/MM/YYYY HH:mm:ss'))
                        logger.info(`Número: ${contactId.user} (retorno META) com perfil ativo no WhatsApp. Adicionado no banco local.`)
                        number = "+" + contactId.user;
                    }
                    else
                    {
                        logger.info(`O número informado: ${number.replace("+","")} não tem um perfil registrado no WhatsApp.`);
                        let uuid = "SM" + generateUUID();
                        await update_status_outbound(id_omni_channel, uuid, account_broker, 13);//13 = Número desconhecido (sem perfil)
                        return null;
                    }
                    
                }
            } 
                        
            //console.log(logger)
            if (!number.includes("g.us")) {
                chatId = number.substring(1) + "@c.us";
            } else {
                chatId = number.substring(1);
            }
            //console.log(chatId);
            //console.log(JSON.stringify(chatsGrups))
            let grupo_to_send = chatsGroups.filter(chat => chat.id._serialized == chatId);
            //console.log(JSON.stringify(grupo_to_send[0]))
            if (file != null && file != undefined && file != '') {
                let media;
                await MessageMedia.fromUrl(file).then(async function (response) {
                    media = response;
                    // verificar se é message de grupo
                    if (grupo_to_send.length != 0) {
                        await grupo_to_send[0].sendMessage(media, { caption: text }).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "MM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem com arquivo enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type} de grupo`)
                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);

                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem com arquivo para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });
                    } else {
                        await client.sendMessage(chatId, media, { caption: text }).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "MM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem com arquivo enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type}`)
                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);
                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });
                    }
                }).catch(async function (error) {
                    logger.info(`Erro URL midia mensagem: ${number.replace('+', '')}`)
                    logger.info(error)
                    await update_status_outbound(id_omni_channel, null, null, 5);
                });

            } else {
                if (latitude != '' && longitude != '') {

                    let location = new Location(Number(latitude), Number(longitude), null)
                    
                    if (grupo_to_send.length != 0) {
                        await grupo_to_send[0].sendMessage(location).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "SM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type}`)
                            
                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);
                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem com localização para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });

                    } else {
                        await client.sendMessage(chatId, location).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "SM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type}`)
                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);
                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem com localização para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });
                    }
                } else {
                    // verificar se é message de grupo
                    if (grupo_to_send.length != 0) {
                        await grupo_to_send[0].sendMessage(text).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "SM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type} de grupo`)

                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);
                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });
                    } else {
                        await client.sendMessage(chatId, text).then(async function (response) {
                            sendMessage = response as Message;
                            let uuid = "SM" + Buffer.from(sendMessage.id.id).toString('base64').toLowerCase().replace(/=/g, "");
                            logger.info(`Messagem enviada para ${number.replace('+', '')} - tipo: ${sendMessage.type}`)
                            
                            await update_status_outbound(id_omni_channel, uuid, account_broker, 2);
                        })
                            .catch(async function (error) {
                                logger.info(`Erro Messagem para: ${number.replace('+', '')}`)
                                logger.info(error)
                                await update_status_outbound(id_omni_channel, null, null, 5);
                            });
                    }
                }
            }
        }catch(e){
            logger.error(`controlador MessageService - gerou uma exceção (classificando status mensagem saída como FALHA): \r\n ${e}`);
            await update_status_outbound(id_omni_channel, null, null, 5);
        }
    }
}


async function update_status_outbound(id_omni_channel, uuid = null, account_broker = null, status_msg) {
    try {
        if(uuid === null || account_broker === null){
            await makeRequestAPI.makeRequestSimple('put_status_outbound', { dmsg: id_omni_channel, smsstatus: status_msg});
        } else {
            await makeRequestAPI.makeRequestSimple('put_status_outbound', { idmsg: id_omni_channel, smsmessagesid: uuid, accountsid: account_broker, smsstatus: status_msg});
        }       
    } catch(e){
        logger.error(`controlador MessageService (update_status_outbound) - gerou uma exceção: \r\n ${e}`)
    }
}

export { MessageServices }
