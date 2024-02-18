import { HttpStatus } from "@nestjs/common";

export class ResultEntity{
    status: boolean = false;
    statusCode: number = null;
    errorMessage: string = null;
    methodName: string = null;
    timeUsed: string = null;
    timeNow: Date = null;

    constructor(){

    }
    
    public async setResult(){
        this.status = true;
        this.statusCode = HttpStatus.OK
    }

    public async setError(errorMessage: string,statusCode: number = null){
        this.status = false;
        this.statusCode = statusCode ?? HttpStatus.BAD_REQUEST;
        this.errorMessage = errorMessage;
    }

    public async setException(errorMessage: string,statusCode: number = null){
        this.status = false;
        this.statusCode = statusCode ?? HttpStatus.CONFLICT;
        this.errorMessage = errorMessage;
    }

    public async setFinal(methodName: string,timeUsed:number,timeNow:Date){
        this.methodName = methodName;
        this.timeUsed = `${timeUsed} sec`;
        this.timeNow = timeNow;
    }

}