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

// Creamos la interfaz para leer datos del usuario.
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Creamos la instancia del cliente
const client = new Client();
const neighbors = {};

function main() {
    console.log("\nBienvenido a Alumchat!");
    console.log('[1] INICIAR SESION');
    console.log('[2] CERRAR SESION');
    console.log('[3] SALIR');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
          case '1':
              loginMain();
              break;
          case '2':
              logoutMain();
              break;
          case '3':
              console.log('\nGracias por usar alumchat. Vuelva pronto!');
              rl.close();
              break;
          default:
              console.log('Opcion invalida! Intente de nuevo!');
              main();
        }
      });
}

/**
 * menu: menu del programa. controla el flujo del programa.
 */
function menu() {
    console.log('\n[1] FLOODING');
    console.log('[2] DISTANCE VECTOR ROUTING');
    console.log('[3] REGRESAR A MENU');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                submenuF();
                break;
            case '2':
                submenuDV();
                break;
            case '3':
                main();
                break;
            default:
                console.log('Opcion invalida! Intente de nuevo!');
                menu();
        }
    });
}

function submenuDV() {
    console.log('\n[1] ECHO');
    console.log('[2] VER CONTACTOS');

    // Leer la opcion del usuario y llamar la funcion correspondente
    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                sendEcho();
                break;
            case '2':
                sendEcho();
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
            menu(); //redigiendo a menu()
        } catch (err) {
            // Si hay un error, se muestra en pantalla y se vuelve a llamar a login()
            console.log(err.message)
            loginMain();
        }
      });
    });
  }

function setUpId(config) {
    console.log(`Names:`, config);
    client.names = config;
    const searchValue = `${client.username}@${client.domain}`;
    // console.log(`searchValue:`, searchValue);
    const nodeId = Object.keys(config).find(key => config[key] === searchValue);
    // console.log(`nodeId:`, nodeId);
    client.router = new Router(nodeId);
}

function setUpIdNeighbors(config) {
    console.log(`Topo:`, config);
    const searchKey = client.router.id;
    console.log(`searchKey:`, searchKey);
    const neighbors = config[searchKey];
    for (let neighbor of neighbors) {
        client.router.addNeighbor(neighbor);
    }
    console.log(`Neighbors:`, client.router.neighbors);
}

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
        const echoMessageCopy = {...echoMessage};
        echoMessageCopy.headers.to = neighborJid;

        const timestamp1 = Date.now();
        echoMessageCopy.payload.timestamp1 = timestamp1;
        try {
            client.directMessage(neighborJid, JSON.stringify(echoMessageCopy));
            console.log(`Sending echo message from Router ${client.username + ", "  + client.router.id} to Router ${neighborJid + ", " + neighbor}`)
        }
        catch (err) {
            console.log(err.message);
        }
    }
}

function updateNeighbors(messageData) {
    const timeDiff = "";
    if(messageData.headers.to === `${client.username}@${client.domain}`) {
        const user = messageData.headers.from;
        const timestamp2 = Date.now();
        const echoMessageCopy = {...messageData};

        echoMessageCopy.payload.timestamp2 = timestamp2;
        timeDiff = echoMessageCopy.payload.timestamp2 - echoMessageCopy.payload.timestamp1;
        console.log(`Echo message from Router ${echoMessageCopy.headers.from} to Router ${echoMessageCopy.headers.to} took ${timeDiff} ms`);
        client.directMessage(user, JSON.stringify(echoMessageCopy));   
    } else {
        const timestamp1 = messageData.payload.timestamp1;
        const timestamp2 = messageData.payload.timestamp2;
        timeDiff = timestamp2 - timestamp1;
        console.log(`Echo message from Router ${messageData.headers.from} to Router ${messageData.headers.to} took ${timeDiff} ms`);
    }

}

function messageListener() {
    if(!client.xmpp) {
        throw new Error("Error en la conexion, intenta de nuevo.");
    }

    client.xmpp.on("stanza", async (stanza) => {
        // console.log(stanza.toString());
        if(stanza.is("message")) {
            // console.log(stanza.toString());
            const type = stanza.attrs.type;
            const from = stanza.attrs.from.split("/")[0];
            const body = stanza.getChildText("body");

            if(type === "chat" && body) {
                console.log(`\n${from}: ${body}`);
                try {
                    const messageData = JSON.parse(body);
                    if (messageData.type === "names" && messageData.config) {
                        setUpId(messageData.config);
                    }
                    else if (messageData.type === "topo" && messageData.config) {
                        setUpIdNeighbors(messageData.config);
                    }
                    else if (messageData.type === "message" && messageData.headers && messageData.paylod) {
                        checkMessage(messageData.headers, messageData.paylod);
                    }
                    else if (messageData.type === "info" && messageData.headers && messageData.paylod) {
                        updateRoutingTable(messageData.headers, messageData.paylod);
                    }
                    else if (messageData.type === "echo" && messageData.headers && messageData.paylod) {
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
                        console.log(`Names:`, messageData.config);
                    }
                } catch (error) {
                    console.error(`Error parsing JSON: ${error}`);
                }
            }
        }
    });
}

//corremos el programa
main();