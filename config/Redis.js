// import { createClient } from 'redis';
const createClient=require('redis');

const client = createClient({
    password: 'ueGTDIRksYbNPp8o6KIcYdiYE1kZ893U',
    socket: {
        host: 'redis-14149.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14149
    }
});

module.exports=client;