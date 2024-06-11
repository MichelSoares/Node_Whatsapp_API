import { Request, Response } from "express";
import {qr_cliet} from "../app";
const QRCode = require('qrcode')
class QRController {
  async handle(request: Request, response: Response) {
    if( typeof qr_cliet != 'undefined' || qr_cliet != null ){
        QRCode.toDataURL(qr_cliet).then(url => {
            response.send(`<div><img src='${url}'/></div>`)
        }).catch(err => {
            console.debug(err)
        })
    }
    
  }
}

export { QRController };