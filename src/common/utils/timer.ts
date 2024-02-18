
export class TakeTimer{
    private timer: any
    private totalSecond: number

    constructor(){
    }

    public async startTimer():Promise<void>{
        this.totalSecond = 0;
        /**
         * *two way set bind,it's both work.
         * one. call method.bind(this)
         * two. call arrow function
         */
        this.timer = setInterval(this.setTime.bind(this), 1000);
        // this.timer = setInterval(()=>this.setTime(), 1000)
    }

    public async endTimer(): Promise<number>{
        clearInterval(this.timer)
        return this.totalSecond;
    }

    private setTime() {
        this.totalSecond = this.totalSecond + 1;
    }
}