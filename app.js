const fs = require('fs/promises');




//file watcher function
(async () => {
        //commands 
        const CREATE_FILE = "create a file";
        const DELETE_FILE = "delete the file";
        const RENAME_FILE = "rename the file";
        const ADD_TO_FILE = "add to the file"

    const createFile = async (path) => {
        try{
            //we want to check whether or not we already have that file
            const existingFileHandle = await fs.open(path, "r");
            existingFileHandle.close();
            return console.log(`The file ${path} already exists.`);
        } catch (e){
            //we dont have the file, now we should create it
            const newFileHandle = await fs.open(path, "w");
            console.log("A new file was successfully created");
            newFileHandle.close();
        }
    };

    const deleteFile = async (path) => {
        try{
            await fs.unlink(path);
            return console.log(`The file ${path} deleted.`);
        } catch (e){
            if(e.code === "ENOENT"){
                //we dont have the file, it throws an error
                console.log("No file at this path to remove.");
            }
            else{
                console.log("An error occurred while removing the file: ");
                console.log(e);
            }     
        }
    };

    const renameFile = async (oldFilePath, newFilePath) => {
        try{
            await fs.rename(oldFilePath, newFilePath);
            return console.log(`The file ${oldFilePath} changed as ${newFilePath}`);
        } catch(e){
            if(e.code === "ENOENT"){
                //we dont have the file, it throws an error
                console.log("No file at this path to rename.");
            }
            else{
                console.log("An error occurred while removing the file: ");
                console.log(e);
            }     
        }
    };
    let addedContent;
    let isWriting = false;
    const addToFile = async (path, content) => {
        if (addedContent === content || isWriting) return;
        let fileHandle = null;
        try{
            isWriting = true;
            const fileHandle = await fs.open(path, "a");
            fileHandle.write(content);
            addedContent = content;
            console.log("The content was added successfully.");
            
        } catch(e){
            console.log("An error occurred while adding the content to the file: ");
            console.log(e);
             
        } finally{
            if (fileHandle) {  // Add null check
                try {
                    await fileHandle.close();
                } catch(e) {
                    console.log("Error closing file: ", e);
                }
            }
        }
    };



    const commandFileHandler = await fs.open("./command.txt", "r");

    commandFileHandler.on("change", async() => {
        // get the size of our file
        const size = (await commandFileHandler.stat()).size;

        // allocate out buffer with the size of file
        const buff = Buffer.alloc(size);

        // the location which we want to start filling our buffer
        const offset = 0;

        // how many bytes we want to read
        const length = buff.byteLength;

        // position that we want to start reading the file from
        const position = 0;

        // we always want to read the whole content (from beginnig all way to the end)
        await commandFileHandler.read(buff, offset, length, position);

        const command = buff.toString("utf-8");

        //create a file:
        //create a file <path>

        if(command.includes(CREATE_FILE)){
            const filePath = command.substring(CREATE_FILE.length + 1);
            createFile(filePath);
        }

        if(command.includes(DELETE_FILE)){
            const filePath = command.substring(DELETE_FILE.length + 1);
            deleteFile(filePath);
        }

        if(command.includes(RENAME_FILE)){
            const _idx = command.indexOf(" to ");
            const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
            const newFilePath = command.substring(_idx + 4);
            renameFile(oldFilePath, newFilePath);
        }
        if(command.includes(ADD_TO_FILE)){
            const _idx = command.indexOf(" this content: ");
            const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
            const content = command.substring(_idx + 15);
            addToFile(filePath, content);
        }
    });
    const watcher = fs.watch("./command.txt");

    for await(const event of watcher){
        if(event.eventType === "change"){
            commandFileHandler.emit("change");   
        }
    }
})();

