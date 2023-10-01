import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
const JWT = require('jsonwebtoken')

@Injectable()
export class AuthGuard implements CanActivate{

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const secretkey = process.env.SECRET_KEY;
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token){
            throw new UnauthorizedException;
        }
        try {
            const payload = await JWT.verify(token,secretkey)
            request['user'] = payload;
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
