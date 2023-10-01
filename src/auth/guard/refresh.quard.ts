import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
const JWT = require('jsonwebtoken');

@Injectable()
export class RefreshGuard implements CanActivate{
    
    async canActivate(context: ExecutionContext): Promise<boolean>{
        const secretkey = process.env.SECRET_KEY;
        const request = context.switchToHttp().getRequest();
        const refreshtoken = this.extractTokenFromHeader(request);
        if(!refreshtoken){
            throw new UnauthorizedException;
        }
        try{
            const payload = await JWT.verify(refreshtoken,secretkey);
            request['user'] = payload;
            delete request.user.iat;
            delete request.user.exp;
        }catch(err){
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
