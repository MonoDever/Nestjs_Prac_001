export const setDateUTC = () => {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();
    const hours = today.getUTCHours();
    const minutes = today.getUTCMinutes();
    const seconds = today.getUTCSeconds();
    const milliSeconds = today.getUTCMilliseconds();
    let dateUTC = Date.UTC(year, month, day, hours, minutes, seconds, milliSeconds)
    return new Date(dateUTC);
}

export const validateEmail = (email: string) =>{
    var pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var output = email.match(pattern);
    if (output != null) {
        return true;
    } else {
        return false;
    }
}