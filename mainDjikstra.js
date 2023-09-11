/**
 * mainDjikstra.js: main para el algortimo de djikstra
 *
 * @author Jose Hernandez
 * @author Pablo Gonzalez
 * @author Javier Mombiela
 * @created 2023-09-06
 * 
 * @requires ./client
 * @requires readline
 * 
 */

const Client = require("./client");
const readline = require('readline');
const fs = require('fs');
const { dijkstra } = require('./djikstra');

// Creamos la interfaz para leer datos del usuario.
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// Creamos la instancia del cliente
const client = new Client();

/**
 * login: inicia sesion en el servidor
 */
async function loginMain() {
    console.log('\nINICIAR SESION:')
    rl.question('Usuario: ', async username => {
        rl.question('Contraseña: ', async password => {
            try {
                await client.login(username, password); //esperando a la funcion login()
                console.log('\nSesion iniciada exitosamente!');
                console.log('Bienvenido de nuevo, ' + username + '!');
                messageListener();
                submenuD(); //redigiendo a menu()
            } catch (err) {
                // Si hay un error, se muestra en pantalla y se vuelve a llamar a login()
                console.log(err.message)
                loginMain();
            }
        });
    });
}

/**
 * submenuD: submenu para el algoritmo de flooding
 */
function submenuD() {
    console.log('\n[ 1 ] MANUAL SETUP');
    console.log('[ 2 ] SEND PACKET');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                manualSetup();
                submenuD();
                break;
            case '2':
                sendPacket();
                submenuD();
                break;
            default:
                console.log('Opcion invalida! Intente de nuevo!');
                submenuD();
        }
    });
}

/**
 * messsageListener: escucha los mensajes que llegan al cliente
 */
function messageListener() {
    if (!client.xmpp) {
        throw new Error("Error en la conexion, intenta de nuevo.");
    }

    // Evento para recibir la respuesta del servidor y conectarse
    client.xmpp.on("stanza", async (stanza) => {
        // console.log(stanza.toString());
        if (stanza.is("message")) {
            // console.log(stanza.toString());
            const type = stanza.attrs.type;
            const from = stanza.attrs.from.split("/")[0];
            const body = stanza.getChildText("body");

            //ver si es mensaje
            if (type === "chat" && body) {
                try {
                    const messageData = JSON.parse(body);
                    if (messageData.type === "names" && messageData.config) {
                        setUpId(messageData.config);
                    }
                    else if (messageData.type === "topo" && messageData.config) {
                        setUpIdNeighbors(messageData.config);
                    }
                    else if (messageData.type === "message" && messageData.headers && messageData.payload) {
                        receivePacket(messageData, from);
                    }

                } catch (error) {
                    console.error(`Error parsing JSON: ${error}`);
                }
            }
            // ver si es broadcast
            else if (type === "headline" && body) {
                try {
                    const messageData = JSON.parse(body);
                    if (messageData.type === "names" && messageData.config) {
                        setUpId(messageData.config);
                    }
                    else if (messageData.type === "topo" && messageData.config) {
                        setUpIdNeighbors(messageData.config);
                    }
                } catch (error) {
                    console.error(`Error parsing JSON: ${error}`);
                }
            }
        }
    });
}

/**
 * manualSetup: Configura el id y los vecinos del cliente
 */
function manualSetup() {
    // leer el archivo
    fs.readFile('topos3.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        // Parsear el contenido del archivo como un JSON
        try {
            const jsonArray = JSON.parse(data);

            // revisar que el JSON sea un array y que tenga al menos dos elementos
            if (Array.isArray(jsonArray) && jsonArray.length >= 2) {
                // agarrar el primer elemento del array
                client.names = jsonArray[0].config;

                const searchValue = `${client.username}@${client.domain}`;
                const nodeId = Object.keys(client.names).find(key => client.names[key] === searchValue);
                client.router = nodeId;

                console.log("Names:", client.names);
                console.log("Router ID:", client.router);

            } else {
                console.error("The JSON array does not contain at least two elements.");
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
}

/**
 * sendPacket: envia un mensaje a un destinatario
 */
function sendPacket() {
    console.log('\nSEND PACKET:')
    rl.question('Destinatario: ', async to => {
        const userJID = `${to}@${client.domain}`;
        rl.question('Mensaje: ', async message => {
            try {
                const shortestPath = dijkstra(client.router, client.names, userJID);
                if (shortestPath.length > 1) {
                    const nextHop = shortestPath[1];
                    const packet = {
                        type: "message",
                        headers: {
                            from: `${client.username}@${client.domain}`,
                            to: userJID,
                            hop_count: 0,
                        },
                        payload: message,
                    };
                    const messageData = JSON.stringify(packet);
                    client.directMessage(client.names[nextHop], messageData);
                } else {
                    console.log(`No route found to ${to}`);
                }
                submenuD();
            } catch (err) {
                console.log(err.message);
                submenuD();
            }
        });
    });
}

//corremos el programa
loginMain();