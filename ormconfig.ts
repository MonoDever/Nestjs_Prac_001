import { ConnectionOptions } from "tls";
export default
{
    type: "mssql",
    // host: "172.17.0.2",
    host: "localhost",
    username: "sa",
    password: "Mo123456789",
    database: "nest&next_practice_001",
    entities:["dist/**/**.entity{.ts,.js}"],
    synchronize: true,
    options:{
        encrypt: false,
        trustServerCertificate: true
    }
} as ConnectionOptions;