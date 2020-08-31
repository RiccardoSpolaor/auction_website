const path = require('path')

function createWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('./dist/index.html');
}

app.whenReady().then(createWindow).catch((err)=>{
    console.log(err);
})


