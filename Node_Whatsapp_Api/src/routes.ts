import { Router } from "express";
import { MessageController } from "./controller/MessageController";
import { QRController } from "./controller/QRController";
const multer = require('multer');
const router = Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const extensaoArquivo = file.originalname.split('.')[1];
     
        const novoNomeArquivo = require('crypto')
            .randomBytes(64)
            .toString('hex');
      
        cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
    }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res, next) => {
    res.send('<h2>Upload realizado com sucesso</h2>')
});
router.get('/', new QRController().handle);
router.post("/messages/send", new MessageController().handle)
export { router }