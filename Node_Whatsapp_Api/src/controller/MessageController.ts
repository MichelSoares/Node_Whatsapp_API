import { Request, Response } from "express";
import { MessageServices } from "../services/MessageServices";

class MessageController {
  async handle(request: Request, response: Response) {
    const {message, dst, file, id_omni_channel, latitude, longitude, description} = request.body;
    //console.log(request.body);
    const service = new MessageServices();

    const result = await service.execute(message, dst, file, id_omni_channel, latitude, longitude, description);
    return response.json(result);
  }
}

export { MessageController };