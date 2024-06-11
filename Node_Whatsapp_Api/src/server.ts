import { serverHttp } from "./app";
import { logger } from './helper/default.logger';

serverHttp.listen(process.env.PORT,() => {
    logger.info(`#############################################################`)
    logger.info(`Server ativo na porta ${process.env.PORT}. número do cliente: ${process.env.NUMERO_CLIENTE}`)
});