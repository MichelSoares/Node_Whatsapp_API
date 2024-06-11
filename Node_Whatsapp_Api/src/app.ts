import "dotenv/config";
import http from "http"
import { router } from "./routes";
import cors from 'cors';
import api from "../src/services/api";
import { makeRequestAPI } from "../src/services/makeRequestAPI"
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs').promises;
const qrcode = require('qrcode-terminal');
var express = require('express');
import { MessageMedia } from "./Interfaces/MessageMedia";
import { logger } from './helper/default.logger';
import { MessageGrupo } from "./Interfaces/MessageGrupo";
import { Chat } from "./Interfaces/Chats";
import { MessageGroupAPI } from "./Interfaces/MessageGroupAPI";
import { MessageAPI } from "./Interfaces/MessageAPI";
import { QRCode } from "./Interfaces/QRCode";
const os = require('os');
const path = require("path");
const util = require('./util');
const app = express();
app.use(cors());
const serverHttp = http.createServer(app);
app.use(express.json());
app.use(router);

let client;
let jwtToken;
let SESSION_FILE_PATH;
let qr_cliet;
let account_broker;
let qrcode_b64;
let isAuth;
let hasQrCode;
let chats;
let chatsGroups;
let chatsGroups_new;
let client_new_session;

process.on("SIGINT", async () => {
  logger.info("(SIGINT) ENCERRANDO O APP...");
  await client.destroy();
  process.exit(0);
})

if (os.type() === "Windows_NT") {
  SESSION_FILE_PATH = __dirname + "\\sessions\\";
} else if (os.type() === "Linux") {
  SESSION_FILE_PATH = __dirname + "/sessions/";
}

const argsPuppeteer = 
[ 
  '--no-sandbox', 
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-gpu'
];

async function Restore_Session(client_id){
    client = new Client({
      takeoverOnConflict: true,
      takeoverTimeoutMs:  0,
      webVersion: '2.2408.1',
      webVersionCache:  { type: "local" },
      puppeteer: { headless: true, args: argsPuppeteer },
      authStrategy: new LocalAuth({dataPath: SESSION_FILE_PATH, clientId: client_id })             
  });
}

async function connectWpp(forceNewSession = false) {
let sessionData = null;
 try{
    
    let numberIsAuth = await makeRequestAPI.makeRequestSimple('get_session_is_auth', { numero : process.env.NUMERO_CLIENTE });      
      
      if(numberIsAuth.dados[0].is_authenticated && numberIsAuth.dados[0].client_id != null){
        let client_id_db = numberIsAuth.dados[0].client_id;
        logger.info('RECUPERANDO SESSÃO...');
        logger.info('VERIFICANDO SE SESSÃO ESTÁ AUTENTICADA: ' + numberIsAuth.dados[0].is_authenticated);     
        logger.info(`CLIENTE: ${process.env.NUMERO_CLIENTE} tem sessão ATIVA! RECUPERANDO SESSÃO - session-${client_id_db}`);
        try{
          await Restore_Session(client_id_db);
        } catch(e) {
          logger.warn(`ERRO recuperar sessão: \n ${e}`);
          await makeRequestAPI.makeRequestSimple('put_reset_session', { numero : process.env.NUMERO_CLIENTE });
            logger.info(`LOGOFF OK - SOLICITANDO NOVA AUTENTICAÇÃO!`);
            return connectWpp();
        }
      }  
      else 
      {
        logger.info('NÃO EXISTE SESSÃO PARA RECUPERAR - criando nova sessão client ID');
        logger.info('DELETANDO DADOS DE SESSÕES INATIVAS...');
        await deletarFileSession(SESSION_FILE_PATH);
        client_new_session = "client-"+ Math.floor(Math.random() * 1000)
        client = new Client({
          takeoverOnConflict: true,
          takeoverTimeoutMs:  0,
          webVersion: '2.2408.1',
          webVersionCache:  { type: "local" },
          puppeteer: { headless: true, args: argsPuppeteer },
          authStrategy: new LocalAuth({dataPath: SESSION_FILE_PATH, clientId: client_new_session}),
          session: sessionData
        });

        await makeRequestAPI.makeRequestSimple('put_set_new_session', { id_new_session: client_new_session, numero: process.env.NUMERO_CLIENTE });

      }  
    
  logger.info(`DIRETÓRIO SESSÃO: ${SESSION_FILE_PATH}`)

  client.initialize();
  logger.info('Inicializando Cliente');

    client.on('qr', (qr) => {
      qr_cliet = qr;
      QRCode.toDataURL(qr_cliet).then(async url => {
          qrcode_b64 = url.split(',')
          if (qrcode_b64[1] != null) {
              try {
                  let numberIfExists = await makeRequestAPI.makeRequestSimple('get_number_exists', { numero: process.env.NUMERO_CLIENTE });
                  if (numberIfExists == 1) {
                      let startUp = await makeRequestAPI.makeRequestSimple('get_last_uptime_qrcode', { numero: process.env.NUMERO_CLIENTE });
                      if (startUp == 1) {
                          logger.info('QRCode - GERANDO/ATUALIZANDO')
                          qrcode.generate(qr, { small: true })
                          //await makeRequestAPI.makeRequestSimple('put_set_new_qrcode', { qrcode_b64: `${qrcode_b64[1]}`, porta: process.env.PORT, sender: process.env.NUMERO_CLIENTE });
                                              
                          const qrcodeJ: QRCode = {
                              qrcode_b64: qrcode_b64[1],
                              porta: process.env.PORT,
                              sender: process.env.NUMERO_CLIENTE
                          }
                          
                          await makeRequestAPI.makeRequestBody('index_qr_code', qrcodeJ);
                          hasQrCode = true;
                      } else {
                          logger.info('last_update acima de 1 minuto. QR Code não será gerado! aguardando nova solicitação!');
                          if (hasQrCode) {
                              await makeRequestAPI.makeRequestSimple('put_reset_qrcode', { numero: process.env.NUMERO_CLIENTE })
                              hasQrCode = false;
                          }
                      }
                  } else {
                      logger.warn(`Nenhum row correspondente, para o número: +${process.env.NUMERO_CLIENTE} . QR Code não gerado, Finalizando programa!`);
                      process.exit(1);
                  }
              } catch (err) {
                  logger.error(err);
              }
          }
      }).catch(err => {
          logger.error(err)
      })
    });
  } catch (error) {
    logger.error('Erro ao conectar com a API: \n', error);
  }

  client.on('authenticated', async (session) => {
    sessionData = session;
  });

  client.on('ready', async () => {
    try {
      account_broker = await makeRequestAPI.makeRequestSimple('get_accountsid', { numero : process.env.NUMERO_CLIENTE });

      if (`${client.info.wid.user}` == `${process.env.NUMERO_CLIENTE}`) {
        //console.log(client);
        logger.info('Versão WhatsApp Web: ' + await client.getWWebVersion())
        logger.info('Profile Name cliente: ' + client.info.pushname)
        logger.info('Cliente está ativo no número: ' + client.info.wid.user + ' - AccountBroker: ' + account_broker)
        isAuth = true
        await makeRequestAPI.makeRequestSimple('put_set_auth', { numero : process.env.NUMERO_CLIENTE });
        chats = await client.getChats();
        chatsGroups = chats.filter(chat1 => chat1.isGroup);
        chatsGroups.forEach(async (chat1: Chat) => {
          await insert_group(chat1);
        });
        
      } else {
        logger.info('O número: ' + client.info.wid.user + ' não está autorizado a logar-se nesta aplicação.')
        //client.destroy()
        await deletarFileSession(SESSION_FILE_PATH)

        setTimeout(() => {
          client.logout()
          //logger.info('Por favor autentique-se com o número pré-cadastrado. Solicitando autenticação novamente.')
          isAuth = false
          connectWpp()
        }, 3000)
      }

    } finally {
      //connection.release()
    }
  });

  client.on('auth_failure', async (msg) => {

    logger.error('Erro autenticação', msg);

    await deletarFileSession(SESSION_FILE_PATH)

    setTimeout(() => {
      connectWpp()
    }, 3000)

  });

  client.on('message', async message => {
  try{
      logger.info(JSON.stringify(message));
      let arquivos;
      let arquivos_url;

      if (chatsGroups != null && chatsGroups != undefined)
      {
          let message_grupo = chatsGroups.filter(chat => chat.id._serialized === message.id.remote);
          message_grupo as MessageGrupo;

        if (message.hasMedia && !message.isStatus && message.type != "e2e_notification") {
        await message.downloadMedia().then(async function (response) {
            arquivos = response as MessageMedia;

            if (arquivos.mimetype.includes("codecs")) {
              let aux_mediacontenttype = arquivos.mimetype.split(';')
              arquivos.mimetype = aux_mediacontenttype[0];
            }

            logger.info(`Arquivo recebido de ${message.from.replace('@c.us', '')} - tipo: ${arquivos.mimetype}`)
            //if(jwtToken == null || jwtToken == undefined) await retToken();

            await UploadFile(arquivos, jwtToken, message_grupo, message);

          }).catch((error) => {
            logger.error(`Erro download arquivo ${error} - nome arquivo: ${arquivos.filename} - formato: ${arquivos.mimetype}`)
          });
      } else {
        if (!message.isStatus && message.type != "e2e_notification") {
          arquivos_url = null;

          if (message_grupo.length != 0) {
            sendMessage_api(message, arquivos_url, null, true);
            logger.info(`Messagem recebida de ${message.from.replace('@c.us', '')} - tipo: ${message.type} de grupo`)
          } else {
            //MEU - TO DO
            // 1º aqui colocar a lógica para diferenciar o VCARD
            // 2º criar arquivo.vcf com o conteúdo do body recebido e salvar com o nome do messageId encriptado em MD5 (caso não exista criar pasta temp em src/temp)
            // 3º criar e fazer a request para API WhatsApp endpoint/service: /api/Upload/SendMsg (somente se o arquivo criado com sucesso)
            // 4º com o retorno da API (url) salvar no banco de dados passando os parâmetros correspondente na function: sendMessage_api
            if (message.type == 'vcard') {
              logger.info(`Mensagem recebida de ${message.from.replace('@c.us', '')} - tipo: ${message.type}`)
              let pathTemp = __dirname + "/temp";
          
              try {
                  await fs.access(pathTemp);
              } catch (error) {
                  logger.info(`Criando diretório temp/`);
                  await fs.mkdir(pathTemp, { recursive: true });
              }
          
              let nameFile = util.convertToMd5(message.id.id);
              let ret = createFileVCF(nameFile, message.body, pathTemp);
          
              if (ret) {
                  let fileEPath = {
                      mimetype: "text/x-vcard",
                      data: Buffer.from(message.body).toString("base64"),
                      filename: nameFile,
                      filesize: null
                  };
          
                  await UploadFile(fileEPath, jwtToken, message_grupo, message);
              } else {
                  logger.info(`Arquivo: ${nameFile}.vcf não encontrado.`);
              }
          }
            else {
              sendMessage_api(message, arquivos_url, null, false);
              if(message.type == 'call_log'){
                logger.info(`Ligação recebida de ${message.from.replace('@c.us', '')} - tipo: ${message.type}`)
              } else {
                logger.info(`Messagem recebida de ${message.from.replace('@c.us', '')} - tipo: ${message.type}`)
              }       
            }
          }
        }
      }
    }
  }catch(e){
    logger.error(`event message - gerou uma exceção: \r\n ${e}`)
    logger.error(`OBJ message full: ` + JSON.stringify(message))
  } 
  });

  async function retToken() {
    try {
      const token = await api.post('api/Login', {
        login: process.env.UPLOAD_USER,
        password: process.env.UPLOAD_PASS,
      });
      jwtToken = token.data;
      //logger.info(`GERANDO TOKEN: ${jwtToken}`);
      return jwtToken;
    } catch (error) {
      logger.error(`Erro ao gerar o TOKEN ${error}`);
      throw error;
    }
  }

async function UploadFile(file, token, message_grupo, message) {
  try {
    const maxMediaSize = 16 * 1024 * 1024; // 16MB para mídia
    const maxOutroFilesize = 100 * 1024 * 1024; // 100MB para outros tipos
    const timeoutRequest = 2 * (60 * 1000);
    
    const allowMediaTypes = [".jpg", ".png", ".mp3", ".mp4", ".vcf"];
    
    //let filesizeMB = file.filesize / (1024 * 1024);
    //const fileExtension = file.filename ? file.filename.toLowerCase().slice(file.filename.lastIndexOf(".")) : "";

    let fileExtension = "." + file.mimetype.split('/')[1];
    const isAllowMediaType = allowMediaTypes.includes(fileExtension);

    if (isAllowMediaType && file.filesize > maxMediaSize) {
      throw new Error(`Tamanho do arquivo excede o limite permitido para mídia (${maxMediaSize / (1024 * 1024)}MB).`);
    }

    if (!isAllowMediaType && file.filesize > maxOutroFilesize) {
      throw new Error(`Tamanho do arquivo excede o limite permitido para arquivo: doc (${maxOutroFilesize / (1024 * 1024)}MB).`);
    }
    const response = await api.post("api/Upload/SendIn_Upload_Node", file, { headers: { "Authorization": `Bearer ${token}` }, maxBodyLength: maxOutroFilesize, timeout: timeoutRequest });
    let isGroup = message_grupo.length == 0 ? false : true;
    sendMessage_api(message, response.data, file.mimetype, isGroup);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const newToken = await retToken();
        return await UploadFile(file, newToken, message_grupo, message);
      } catch (error) {
        logger.error(`Erro ao renovar token: ${error}`);
        throw error;
      }
    } else {
      logger.error(`Erro upload arquivo ${error} - nome arquivo: ${file.filename} - formato: ${file.mimetype} - tamanho: ${(file.filesize / (1024 * 1024)).toFixed(2)} MB`);
      throw error;
    }
  }
}


  function createFileVCF(fileName, contentVCF, dstFile){
    if (fs.access(dstFile)) {
      const caminhoDestino = path.join(dstFile, `${fileName}.vcf`);
      try{
        fs.writeFile(caminhoDestino, contentVCF, 'utf8');
          return true;
      } catch(error){
          logger.error(`Erro catch ao criar/gravar - text/vcard: \n ${error}`);
          return false;
      }   
    } else {
      logger.error(`Erro ao criar/gravar - text/vcard`);
    }
  }

  client.on('disconnected', async (reason) => {
    if (isAuth) {
      try {
        sessionData = null;
        await makeRequestAPI.makeRequestSimple('put_reset_session', { numero : client.info.wid.user });
        logger.info('Cliente desconectou, número: ' + client.info.wid.user);
        logger.info('Motivo desconexão: ' + reason);
        //await client.logout();
        await client.destroy();
        await deletarFileSession(SESSION_FILE_PATH);
        setTimeout(() => {
          connectWpp()
        }, 3000)

      } catch (error) {
        logger.info('Erro em terminar a sessão %s', error)
      }
    } else {
      logger.info('Por favor autentique-se com o número pré-cadastrado. Solicitando autenticação novamente.')
    }
  });

  client.on('message_ack', async (message, ack) => {
    /*
      POSSIBLE ACK VALUES:
      ACK_ERROR: -1 - Erro
      ACK_PENDING: 0 - Pendente
      ACK_SERVER: 1 - Processado no servidor
      ACK_DEVICE: 2 - Já está no dispositivo, logo foi ENTREGUE
      ACK_READ: 3 - Lida
      ACK_PLAYED: 4 - Executado
    */
    if(ack === undefined || ack === null) return;

    let uuid = message.hasMedia ? "MM" + Buffer.from(message.id.id).toString('base64').toLowerCase().replace(/=/g, "") : "SM" + Buffer.from(message.id.id).toString('base64').toLowerCase().replace(/=/g, "");
    let statusmsg, desc_status;
    try{
      switch(ack){
        case -1:
          statusmsg = 5;
          desc_status = 'FALHOU';
          break;
        case 0:
          statusmsg = 0;
          desc_status = 'ACEITO';
          break;
        case 1:
          statusmsg = 1
          desc_status = 'PROCESSADA';
          break;
        case 2:
          statusmsg = 3
          desc_status = 'ENTREGUE';
          break;
        case 3:
          statusmsg = 10
          desc_status = 'LIDA';
          break;
        case 4:
          statusmsg = 10
          desc_status = 'LIDA/EXECUTADA';
          break;
      }
        await makeRequestAPI.makeRequestSimple('put_set_status_outbound', { statusmsg: statusmsg, uuid: uuid })
        logger.info(`Atualizado o status da messagem enviada - smsmessagesid: ${uuid} \t status: ${desc_status}`)
      } catch(e){
      logger.error(`evento (message_ack) - gerou uma exceção: \r\n ${e} - status ack: ${ack}`);
      } 
  });

  client.on('group_update', async (grp_up) => {
    if (grp_up.type == "subject") {
      try {
        await makeRequestAPI.makeRequestSimple('put_group_update', { nome: myReplace(grp_up.body), group_id: grp_up.id.remote, numero: client.info.wid.user})
        let newName = splitString(grp_up.id.participant, "@");
        logger.info(`Atualizado o nome do Grupo ID: ${grp_up.id.remote}, para: ${grp_up.body}, renomeado pelo número: ${newName[0]}`)
      } catch (e) {
        logger.error(`evento (group_update) - gerou uma exceção: \r\n ${e}`);
      } 
    }
  })

  client.on('group_leave', async (grp_leave) => {
    try {
      let nomeGrupoApagado = await makeRequestAPI.makeRequestSimple('del_group_leave', { group_id: grp_leave.id.remote, numero: client.info.wid.user });
      let numLeaveGroup = splitString(grp_leave.id.participant, "@");
      if(nomeGrupoApagado != null || numLeaveGroup != null) {
        logger.info(`Número: +${numLeaveGroup[0]} removido do grupo: ${nomeGrupoApagado.dados[0].nome} - (ID: ${grp_leave.id.remote})`)
      }
    } catch (e) {
      logger.error(`evento (group_leave) - gerou uma exceção: \r\n ${e}`);
    } 
  })

  client.on('group_join', async (grp_join) => {
    try {
      const chats = await client.getChats();
      chatsGroups_new = chats.filter(chat => chat.isGroup && chat.id._serialized === grp_join.id.remote);
      chatsGroups_new.forEach(async (chat: Chat) => {
        await insert_group(chat);
        let numJoinGroup = splitString(grp_join.id.participant, "@");
        
        if(numJoinGroup != null){
          logger.info(`Número: +${numJoinGroup[0]} adicionado ao grupo: ${chat.name} - (ID: ${chat.id._serialized})`)
        }
      });
    } catch (e) {
      logger.error(`evento (group_join) - gerou uma exceção: \r\n ${e}`);
    } 
  })
}

function splitString(stringToSplit, separator){
  var arrayOfStrings = stringToSplit.split(separator);
  return arrayOfStrings;
}

function myReplace(text){
  if(text != null && text != undefined){
    return text.replace(/(')/g, "''");
  } else {
    return text;
  }
}

async function insert_group(chat) {
  try {
    if(!chat.name) return;
    await makeRequestAPI.makeRequestSimple('ins_group_join', { group_id: chat.id._serialized, nome: myReplace(chat.name), numero: client.info.wid.user });
  } finally { }
}

async function deletarFileSession(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      await fs.rm(filePath, { recursive: true });
      logger.info(`${filePath} - Foi deletado`);
    }
    logger.info('Conteúdo do diretório foi deletado.');
  } catch (err) {
    logger.error(`Erro ao deletar conteúdo do diretório: ${err}`);
  }
}


connectWpp();

async function sendMessage_api(message, file, mediacontenttype, grupo) {
  try {

    let mediaContentType: string | null = mediacontenttype;

    if (mediacontenttype === 'text/x-vcard') {
      //logger.error('ENTROU AQUI...mediacontenttype : ' + mediaContentType)
      message.body = '';
    } else {
      mediaContentType = mediacontenttype;
    }

    let auxLatitude, auxLongitude
    if (message.type == 'location') {
      auxLatitude = message.location.latitude
      auxLongitude = message.location.longitude
      message.body = ''
      //message.body = message.location.description
    } else {
      auxLatitude = null
      auxLongitude = null
      //message.body = `'${message.body}'`
    }
    if (grupo) {
      message.body = `*${message.author.replace("@c.us", "")}*: ${message.body}`
    }
    let nummedia = 1;
    let uuid;
    if (file == null) {
      uuid = "SM" + Buffer.from(message.id.id).toString('base64').toLowerCase().replace(/=/g, "");
      nummedia = 0;
      mediacontenttype = null;
    } else {
      //file = `'${file}'`
      uuid = "MM" + Buffer.from(message.id.id).toString('base64').toLowerCase().replace(/=/g, "");
      mediacontenttype = `'${mediacontenttype}'`
    }
    
    //const tarifaAtual = await makeRequestAPI.makeRequestSimple('get_cost_msg_session', '');

    let auxIsForwarded = message.isForwarded != null ?  message.isForwarded : false;

    if(grupo){
      let nameGroup = "";
      await message.getChat().then(async res => {  nameGroup = res.name
        if(nameGroup != null && message._data.notifyName != null && message._data.author != null){

          const msgGroupAPI: MessageGroupAPI = {
            mediacontenttype: mediaContentType != null ? mediaContentType : null,
            smsmessagesid: uuid,
            nummedia: nummedia,
            smssid: uuid,
            body: myReplace(message.body),
            src: `${message.to.replace('@c.us', '')}`,
            accountsid: account_broker,
            dst: `${message.from.replace('@c.us', '')}`,
            mediaurl: file != null ? file : null,
            date: util.dataHorariotimestampFormatada(message.timestamp),
            cost_cli: null,
            latitude: auxLatitude,
            longitude: auxLongitude,
            profilename: grupo ? nameGroup : null,
            notifyname: message._data.notifyName != null ? myReplace(message._data.notifyName) : null,
            author: message._data.author != null ? myReplace(message._data.author) : null,
            isforwarded: auxIsForwarded,
            forwardingscore: message.forwardingScore != null ? message.forwardingScore : null
          }

          const result = await makeRequestAPI.makeRequestBody('index_inbound_grp', msgGroupAPI);

        } else {
          logger.error("ERRO msg entrada grupo: \n" + JSON.stringify(message));
        }
      });
    } else {
      if(message._data.notifyName != null){       
        
        const msgAPI: MessageAPI = {
            mediacontenttype: mediaContentType != null ? mediaContentType : null,
            smsmessagesid: uuid,
            nummedia: nummedia,
            smssid: uuid,
            body: myReplace(message.body),
            src: `${message.to.replace('@c.us', '')}`,
            accountsid: account_broker,
            dst: `${message.from.replace('@c.us', '')}`,
            mediaurl: file != null ? file : null,
            date: util.dataHorariotimestampFormatada(message.timestamp),
            cost_cli: null,
            latitude: auxLatitude,
            longitude: auxLongitude,
            profilename: myReplace(message._data.notifyName),
            isforwarded: auxIsForwarded,
            forwardingscore: message.forwardingScore != null ? message.forwardingScore : null
        }

        //logger.info('OBJETO antes da request: ' + JSON.stringify(msgAPI));
        const result = await makeRequestAPI.makeRequestBody('index_inbound', msgAPI);

      } else {
        if(message.type != 'call_log'){
          logger.error("ERRO msg entrada individual: \n" + JSON.stringify(message));  
        }      
      }
    }
  } catch(e){
    logger.error(`sendMessage_api - gerou uma exceção: \r\n ${e}`)
    logger.error(`Message full sendMessage_api: \r\n ${JSON.stringify(message)}`)
  } 
}

export { serverHttp, client, qr_cliet, account_broker, chatsGroups, logger }

