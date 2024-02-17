
export class TakeTimer{
    private timer: any

    constructor(
        public totalSecond: number,

        ){
    }

    public async startTimer(){
        this.totalSecond = 0;
        this.timer = setInterval(this.setTime, 1000);
    }

    public async endTimer(): Promise<number>{
        clearInterval(this.timer)
        return this.totalSecond;
    }

    private setTime() {
        this.totalSecond = this.totalSecond + 1;
    }
}