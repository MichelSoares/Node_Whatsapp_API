const cryptoMd5 = require("crypto");

function dataHorariotimestampFormatada(timestamp){
    var data = new Date(timestamp * 1000),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
        return anoF+"-"+mesF+"-"+diaF + ' ' + data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds() + '.' + data.getMilliseconds();
  }

  function generateUUID() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let uuid = '';
    
    for (let i = 0; i < 29; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uuid += characters.charAt(randomIndex);
    }
    
    return uuid;
    }

    function convertToMd5(value : string) {
      const hash = cryptoMd5.createHash('md5');
      hash.update(value);
      return hash.digest('hex');
    }


  module.exports = {
    dataHorariotimestampFormatada,
    generateUUID,
    convertToMd5
};