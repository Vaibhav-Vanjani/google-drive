import { readdir } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';

const server = http.createServer(async(req,res)=>{
    if(req.url === '/favicon.ico')return;

    if(req.url !== '/'){
        const readstream = createReadStream(`./storage${req.url}`);
        readstream.pipe(res);
        return;
    }

    const files = await readdir('./storage');

    let fileHtmlList = "";
    for(const file of files){
        fileHtmlList+=`<li><a href="${file}">${file}</a> <button>Download</button></li>`
    }

    // res.setHeader('Content-Type','text/html');
    
    let content = await fs.readFile("./index.html", "utf8");
    content = content.replace('${dynamicContent}',fileHtmlList);

    res.end(content);
})

server.listen(4000,'0.0.0.0',()=>{
    console.log("Server started at 4000");
})
