import { HttpStatus } from "@nestjs/common";

export class ResultEntity{
    private status: boolean = false;
    public get Status(): boolean{
        return this.status;
    }
    private statusCode: number = null;
    get StatusCode(): number{
        return this.statusCode;
    }
    private errorMessage: string = null;
    get ErrorMessage(): string{
        return this.errorMessage;
    }
    protected methodName: string = null;
    get MethodName(): string{
        return this.methodName;
    }
    protected timeUsed: string = null;
    get TimerUsed(): string{
        return this.timeUsed;
    }
    private timeNow: Date = null;
    get TimeNow(): Date{
        return this.timeNow;
    }

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