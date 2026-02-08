import { readdir } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';

async function serveDir({path,req,res}){
    try {
         const files = await readdir(path);

        let fileHtmlList = "";
        for(const file of files){
            console.log("path->",path);
            console.log("file->",file);
            
            const stats = await fs.stat(`${path}/${file}`);
           let folderpath = path.replace('.','');
            if(stats.isFile()){
                fileHtmlList+=`<li><a href="${folderpath}/${file}">${file}</a> <a href="${folderpath}/${file}_download">Download</a>`
            }
            else if(stats.isDirectory()){
                fileHtmlList+=`<li><a href="${folderpath}/${file}">${file}</a>`
            }
        }

        let content = await fs.readFile("./index.html", "utf8");
        content = content.replace('${dynamicContent}',fileHtmlList);

        res.end(content);
    } catch (error) {
        console.log(error);
        res.end('NOT FOUND 404');
    }
   
}

function serveFile({path,req,res}){
     try {
         let requestUrl = req.url;
         if(requestUrl.includes('_download')){
             requestUrl = requestUrl.replace('_download','');
             const fileName = requestUrl.split('/').at(-1);
             res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);                
         }
         else if(requestUrl.includes('.mp4')){
            res.setHeader('content-type',"video/mp4");
         }
         console.log(requestUrl);
         const readstream = createReadStream(`.${requestUrl}`);
         readstream.pipe(res);
     } catch (error) {
        console.log(error);
         res.end("Not Found");
     }
}


const server = http.createServer(async(req,res)=>{
    if(req.url === '/favicon.ico')return;

    if(req.url !== '/'){
        try {
            const fileTypePath = req.url.replace('_download','');
            const stats = await fs.stat(`.${fileTypePath}`);
            if(stats.isFile()){
                serveFile({path:`.${req.url}`,req,res});
            }
            else{
                serveDir({path:`.${req.url}`,req,res});
            }
        } catch (error) {
            console.log(error);
            res.end('404 NOT FOUND');
        }
        
        return;
    }

    serveDir({path:'./storage',req,res});
})


server.listen(4000,'0.0.0.0',()=>{
    console.log("Server started at 4000");
})
