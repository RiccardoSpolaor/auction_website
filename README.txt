# auction_website

Un sito di puntate d'asta scritto in Typescript.
Il client gira su ambiente Angular e il server in Node.js.
Database MongoDB è utilizzato per mantenere i dati.
Presenti una versione mobile realizzata con Cordova ed una versione desktop per linux realizzata con Electron.

***URI PER CONNESSIONE A MONGODB***
E' necessario entrare nella cartella 'auction_website_server'. 
L'uri per la connessione a MongoDB è situato alla riga 239 del file 'auction_website.ts'.

***AVVIO SERVER***
Aprire un terminale nel percorso './auction_website/auction_website_server' e digitare i seguenti comandi:
$ npm install
$ npm run compile
$ npm start

***AVVIO WEB CLIENT***
Con server attivo:
Aprire un terminale nel percorso './auction_website/auction_website_client' e digitare i seguenti comandi:
$ npm install
$ ng serve --open

***AVVIO MOBILE CLIENT***
Con server attivo:
Aprire un terminale nel percorso './auction_website/auction_website_mobile/mobile':
- Esportare la variabile d'ambiente ANDROID_SDK_ROOT con la directory relativa all'Android SDK;
- Aggiungere ANDROID_SDK_ROOT/platform-tools al path corrente; 

Digitare i seguenti comandi:

$ npm install
$ cordova run android

Aprire un altro terminale alla directory './auction_website/auction_website_mobile/mobile' e digitare il seguente comando:
$ adb install ./platforms/android/app/build/outputs/apk/debug/app-debug.apk

***AVVIO DESKTOP CLIENT***
Con server attivo:

Per eseguire su piattaforma linux:
- installare il file .deb  situato nella cartella './auction_website/auction_website_desktop/desktop/installer'

Per eseguire su altre piattaforme (non testato in quanto non ne siamo a disposizione):
Aprire il terminale nel percorso './auction_website/auction_website_desktop/desktop' e digitare il seguente comando:
$ npm install
$ npx electron packager ./ app --platform=/*piattaforma desiderata*/ 

Le varie piattaforme su cui si può creare sono:
Windows (32/64 bit)
macOS (formerly known as OS X)
Linux (x86/x86_64)

