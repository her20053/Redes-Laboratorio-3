/**
 * main.js: punto de entrada del programa. controla el flujo del programa.
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
const Router = require("./distanceVector")
const readline = require('readline');
const fs = require('fs');

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
                submenuF(); //redigiendo a menu()
            } catch (err) {
                // Si hay un error, se muestra en pantalla y se vuelve a llamar a login()
                console.log(err.message)
                loginMain();
            }
        });
    });
}

function submenuF() {
    console.log('\n[ 1 ] MANUAL SETUP');
    console.log('[ 2 ] SEND PACKET');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                manualSetup();
                submenuF();
                break;
            case '2':
                sendPacket();
                submenuF();
                break;
            default:
                console.log('Opcion invalida! Intente de nuevo!');
                submenuF();
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

    client.xmpp.on("stanza", async (stanza) => {
        // console.log(stanza.toString());
        if (stanza.is("message")) {
            // console.log(stanza.toString());
            const type = stanza.attrs.type;
            const from = stanza.attrs.from.split("/")[0];
            const body = stanza.getChildText("body");

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
    // Read the contents of 'topos.json'
    fs.readFile('topos2.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        // Parse the entire JSON array
        try {
            const jsonArray = JSON.parse(data);

            // Check if the array contains at least two elements
            if (Array.isArray(jsonArray) && jsonArray.length >= 2) {
                // Retrieve the first two elements as dictionaries
                client.names = jsonArray[0].config;
                const neighborsDic = jsonArray[1].config;

                // Now you can access client.names and neighborsDic
                console.log("names:", client.names);
                console.log("topo:", neighborsDic);

                const searchValue = `${client.username}@${client.domain}`;
                // console.log(`searchValue:`, searchValue);
                const nodeId = Object.keys(client.names).find(key => client.names[key] === searchValue);
                console.log(`nodeId:`, nodeId);
                client.router = new Router(nodeId);

                const searchKey = client.router.id;
                console.log(`searchKey:`, searchKey);
                const neighbors = neighborsDic[searchKey];
                for (let neighbor of neighbors) {
                    client.router.addNeighbor(neighbor);
                    client.router.routingTable[neighbor] = 1;
                    client.router.nextHop[neighbor] = neighbor;
                }
                console.log(`Neighbors:`, client.router.neighbors);
                console.log(`Routing Table:`, client.router.routingTable);

            } else {
                console.error("The JSON array does not contain at least two elements.");
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
}

/**
 * setUpId: Configura el id del cliente
 * @param {dictionary} config : Diccionario con la configuracion de los vecinos
 */
function setUpId(config) {
    client.names = config;
    const searchValue = `${client.username}@${client.domain}`;
    // console.log(`searchValue:`, searchValue);
    const nodeId = Object.keys(config).find(key => config[key] === searchValue);
    // console.log(`nodeId:`, nodeId);
    client.router = new Router(nodeId);
}

/**
 * setUpIdNeighbors: Configura los vecinos del cliente
 * @param {dictionary} config : Diccionario con la configuracion de los vecinos
 */
function setUpIdNeighbors(config) {
    const searchKey = client.router.id;
    const neighbors = config[searchKey];
    for (let neighbor of neighbors) {
        client.router.addNeighbor(neighbor);
        client.router.routingTable[neighbor] = -1;
    }
    console.log(`Neighbors:`, client.router.neighbors);
    console.log(`Routing Table:`, client.router.routingTable);
}

function sendPacket() {

    console.log('\nSEND PACKET:')
    rl.question('Destinatario: ', async to => {
        const userJID = `${to}@${client.domain}`;
        rl.question('Mensaje: ', async message => {
            try {
                const packet = {
                    type: "message",
                    headers: {
                        from: `${client.username}@${client.domain}`,
                        to: userJID,
                        hop_count: 0,
                    },
                    payload: message,
                };

                for (let neighbor of client.router.neighbors) {
                    const messageData = JSON.stringify(packet);
                    client.directMessage(client.names[neighbor], messageData);
                }
            } catch (err) {
                // Si hay un error, se muestra en pantalla y se vuelve a llamar a login()
                console.log(err.message)
                loginMain();
            }
        });
    });
}

function receivePacket(messageData, origin) {

    const packet = {
        type: "message",
        headers: {
            from: messageData.headers.from,
            to: messageData.headers.to,
            hop_count: messageData.headers.hop_count,
        },
        payload: messageData.payload,
    };

    if (packet.headers.to === `${client.username}@${client.domain}`) {
        console.log(`\n[ receivePacket ] Mensaje recibido de ${packet.headers.from}: ${packet.payload} \n[ receivePacket ] Con ${packet.headers.hop_count} saltos`);
    }
    else {
        packet.headers.hop_count += 1;
        const messageData = JSON.stringify(packet);

        for (let neighbor of client.router.neighbors) {
            if (neighbor !== origin) {
                client.directMessage(client.names[neighbor], messageData);
            }
        }
    }

}


loginMain();