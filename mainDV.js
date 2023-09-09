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

function submenuDV() {
    console.log('\n[1] MANUAL SETUP');
    console.log('[2] ECHO');
    console.log('[3] SEND ROUTING TABLE');
    console.log('[4] SEND PACKET');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                manualSetup();
                submenuDV();
                break;
            case '2':
                sendEcho();
                submenuDV();
                break;
            case '3':
                sendRoutingTable();
                submenuDV();
                break;
            case '4':
                sendPacket();
                break;
            default:
                console.log('Opcion invalida! Intente de nuevo!');
                submenuDV();
        }
    });
}

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
                submenuDV(); //redigiendo a menu()
            } catch (err) {
                // Si hay un error, se muestra en pantalla y se vuelve a llamar a login()
                console.log(err.message)
                loginMain();
            }
        });
    });
}

/**
 * sendPacket: envia un mensaje a un usuario
 */
function sendPacket() {
    console.log('\nSEND PACKET:')
    rl.question("Usuario: ", user => {

        const userJid = `${user}@${client.domain}`;
        const nodeId = Object.keys(client.names).find(key => client.names[key] === userJid); //agarrar el id del nodo

        rl.question("Mensaje: ", message => {

            //agararr el nextHop
            const nextHop = client.router.getNextHop(nodeId);
            //agarrar el usuario del nextHop
            const nextHopRouter = client.names[nextHop];
            console.log(`Destination : ${userJid + ", " + nodeId} NextHop: ${nextHopRouter + ", " + nextHop}`)


            const messageData = {
                type: "message",
                headers: {
                    from: `${client.username}@${client.domain}`,
                    to: userJid,
                    hop_count: 0,
                },
                payload: message,
            };

            client.directMessage(nextHopRouter, JSON.stringify(messageData));
            console.log(`Mensaje enviado a ${nextHopRouter}`);
            submenuDV();

        });
    });
}

function receivePacket(messageData) {
    // console.log(`\n${messageData.headers.from}: ${messageData.payload}`);
    const destination = messageData.headers.to;

    //revisar si el mensaje es para el cliente
    if (destination === `${client.username}@${client.domain}`) {
        console.log(`Mensaje recibido en Router ${client.router.id}: ${messageData.payload}`);
    }
    else {

        //agarramos el nodo del usuario
        const nodeId = Object.keys(client.names).find(key => client.names[key] === destination); //agarrar el id del nodo
        console.log(`\nDestination : ${destination + ", " + nodeId}`)
        //reenviar el mensaje
        const nextHop = client.router.getNextHop(nodeId);
        const nextHopRouter = client.names[nextHop];
        console.log(`Forwarding message from Router ${client.username + ", " + client.router.id} to Router ${nextHopRouter + ", " + nextHop}`);
        client.directMessage(nextHopRouter, JSON.stringify(messageData));
    }
}

/*
 * Funcion que envia las tablas de enrutamiento a los vecinos
*/
function sendRoutingTable() {

    // Creamos la stanza que lleva el payload del mensaje
    const infoMessage = {
        type: "info",
        headers: {
            from: `${client.username}@${client.domain}`,
            to: "",
            hop_count: 0,
        },
        payload: client.router.routingTable,
    };


    for (let neighbor of client.router.neighbors) {
        const neighborJid = client.names[neighbor];
        const infoMessageCopy = { ...infoMessage };
        infoMessage.headers.to = neighborJid;
        client.directMessage(neighborJid, JSON.stringify(infoMessageCopy));

    }

}

/**
 * updateRoutingTable: Actualiza la tabla de enrutamiento
 * @param {string} messageData : Mensaje recibido
 */
function updateRoutingTable(messageData) {

    const original_routing_table = client.router.routingTable;
    const neighbor_routing_table = messageData.payload;
    const neighborNodeName = Object.keys(client.names).find(key => client.names[key] === messageData.headers.from);

    // console.log("\n - updateRoutingTable(messageData) Names: ", client.names);
    // console.log("\n - updateRoutingTable(messageData) From: ", messageData.headers.from);
    // console.log("\n - updateRoutingTable(messageData) NeighborNodeName: ", neighborNodeName);

    client.router.updateRoutingTable(neighborNodeName, neighbor_routing_table);

    // Realizamos validaciones para saber si se actualizo la tabla de enrutamiento
    if (JSON.stringify(client.router.routingTable) !== JSON.stringify(original_routing_table)) {

        console.log("\n - updateRoutingTable(messageData): Se entro al if");
        console.log("\n - updateRoutingTable(messageData): Routing Table Actualizada: ", client.router.routingTable);
        console.log("\n - updateRoutingTable(messageData): Routing Table Original: ", original_routing_table);

        // Enviamos la tabla de enrutamiento a los vecinos
        sendRoutingTable();

    }
    else {
        console.log("\n - updateRoutingTable(messageData): No se entro al if");
        console.log("\n - updateRoutingTable(messageData): Routing Table Actualizada: ", client.router.routingTable);
        console.log("\n - updateRoutingTable(messageData): Routing Table Original: ", original_routing_table);
        console.log("\n - updateRoutingTable(messageData): NextHop: ", client.router.nextHop);
    }
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
    console.log(`Names:`, config);
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
    console.log(`Topo:`, config);
    const searchKey = client.router.id;
    console.log(`searchKey:`, searchKey);
    const neighbors = config[searchKey];
    for (let neighbor of neighbors) {
        client.router.addNeighbor(neighbor);
        client.router.routingTable[neighbor] = -1;
    }
    console.log(`Neighbors:`, client.router.neighbors);
    console.log(`Routing Table:`, client.router.routingTable);
}

/**
 * sendEcho: Envia un mensaje de echo a los vecinos
 */
async function sendEcho() {

    const echoMessage = {
        type: "echo",
        headers: {
            from: `${client.username}@${client.domain}`,
            to: "",
        },
        payload: {
            timestamp1: "",
            timestamp2: "",
        },
    };

    const neighbors = client.router.neighbors;

    for (let neighbor of neighbors) {
        const neighborJid = client.names[neighbor];
        const echoMessageCopy = { ...echoMessage };
        echoMessageCopy.headers.to = neighborJid;

        const timestamp1 = Date.now();
        echoMessageCopy.payload.timestamp1 = timestamp1;
        try {
            client.directMessage(neighborJid, JSON.stringify(echoMessageCopy));
            console.log(`Sending echo message from Router ${client.username + ", " + client.router.id} to Router ${neighborJid + ", " + neighbor}`)
        }
        catch (err) {
            console.log(err.message);
        }
    }
}

/**
 * updateNeighbors: Actualiza la tabla de enrutamiento
 * @param {String} messageData : Mensaje recibido
 */
function updateNeighbors(messageData) {
    console.log("object:", messageData);
    let timeDiff = 0;
    if (messageData.headers.to === `${client.username}@${client.domain}`) {
        const user = messageData.headers.from;
        const timestamp2 = Date.now();
        const echoMessageCopy = { ...messageData };

        echoMessageCopy.payload.timestamp2 = timestamp2;
        timeDiff = Math.abs(echoMessageCopy.payload.timestamp2 - parseInt(echoMessageCopy.payload.timestamp1));
        console.log(`Echo message from Router ${echoMessageCopy.headers.from} to Router ${echoMessageCopy.headers.to} took ${timeDiff} ms`);
        client.directMessage(user, JSON.stringify(echoMessageCopy));

        // Actualizar tabla de enrutamiento
        // Buscamos la clave del usuario en la tabla de enrutamiento
        const nodeId = Object.keys(client.names).find(key => client.names[key] === user);

        // Actualizamos la tabla de enrutamiento
        client.router.routingTable[nodeId] = timeDiff;
        console.log(`Routing Table Actualizada:`, client.router.routingTable);

    } else {
        console.log("Else");
        // console.log(`Original timestamp1: ${messageData.payload.timestamp1}`);
        // console.log(`Original timestamp2: ${messageData.payload.timestamp2}`);

        const timestamp1 = parseInt(messageData.payload.timestamp1);
        const timestamp2 = parseInt(messageData.payload.timestamp2);

        // console.log(`Parsed timestamp1: ${timestamp1}`);
        // console.log(`Parsed timestamp2: ${timestamp2}`);

        timeDiff = Math.abs(timestamp2 - timestamp1);
        console.log(`Echo message from Router ${messageData.headers.from} to Router ${messageData.headers.to} took ${timeDiff} ms`);


        // Actualizar tabla de enrutamiento
        // Buscamos la clave del usuario en la tabla de enrutamiento
        const nodeId = Object.keys(client.names).find(key => client.names[key] === messageData.headers.to);

        // Actualizamos la tabla de enrutamiento
        client.router.routingTable[nodeId] = timeDiff;
        console.log(`Routing Table Actualizada:`, client.router.routingTable);
    }

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
                console.log(`\n${from}: ${body}`);
                try {
                    const messageData = JSON.parse(body);
                    if (messageData.type === "names" && messageData.config) {
                        setUpId(messageData.config);
                    }
                    else if (messageData.type === "topo" && messageData.config) {
                        setUpIdNeighbors(messageData.config);
                    }
                    else if (messageData.type === "message" && messageData.headers && messageData.payload) {
                        receivePacket(messageData);
                    }
                    else if (messageData.type === "info" && messageData.headers && messageData.payload) {
                        updateRoutingTable(messageData);
                    }
                    else if (messageData.type === "echo" && messageData.headers && messageData.payload) {
                        updateNeighbors(messageData);
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
                    else if (messageData.type === "message" && messageData.headers && messageData.payload) {
                        receivePacket(messageData);
                    }
                    else if (messageData.type === "info" && messageData.headers && messageData.payload) {
                        updateRoutingTable(messageData);
                    }
                    else if (messageData.type === "echo" && messageData.headers && messageData.payload) {
                        updateNeighbors(messageData);
                    }
                } catch (error) {
                    console.error(`Error parsing JSON: ${error}`);
                }
            }
        }
    });
}

//corremos el programa
loginMain();