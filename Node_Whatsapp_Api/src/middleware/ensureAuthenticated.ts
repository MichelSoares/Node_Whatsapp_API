import {Request,Response,NextFunction} from "express"
import {Secret, verify} from "jsonwebtoken"

interface IPayload{
    sub:string
}

export function ensureAuthenticated(request: Request, response: Response,next: NextFunction){
    const authToken= request.headers.authorization;

    if(!authToken){
        response.status(401).json({errorCode:"token.invalid"})
    }else{
    const [,token]=authToken?.split(" ")
    try {
        const {sub}  =verify(token,process.env.JWT_SECRET as Secret) as IPayload
        request.user_id=sub;
        return next()
    } catch (error) {
        response.status(401).json({errorCode:"token.expired"})
    }
    }
   
}