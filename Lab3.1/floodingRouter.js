/**
 * Flooding Router
 */

/**
 * Router: Representa un router en la red
 */
class Router {
    /**
     * constructor: Crea una instancia de la clase Router
     * @param {String} id : Identificador del router
     */
    constructor(id) {
        this.id = id;
        this.neighbors = [];
    }

    /**
     * addNeighbor: Agrega un vecino al router
     * @param {String} neighbor : Identificador del vecino
     */
    addNeighbor(neighbor) {
        this.neighbors.push(neighbor);
    }

     /**
     * sendPacket: Envia un paquete a un destino especifico
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     * @param {Int} ttl : Time to live
     */
    sendPacket(destination, message, ttl) {
        for (let neighbor of this.neighbors) {
            console.log(`\nSending message from Router ${this.id} to Router ${neighbor.id}`)
            neighbor.receivePacket(destination, message, ttl, this.id);
        }
    }

    /**
     * forwardPacket: Reenvia un paquete a un destino especifico
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     * @param {Int} ttl : Time to live
     * @param {String} sourceId : Identificador del router que envió el paquete
     */
    forwardPacket(destination, message, ttl, sourceId) {
        if (ttl <= 0) {
            console.log(`Packet dropped at Router ${this.id}, TTL expired.`);
            return;
        }

        console.log(`Forwarding message from Router ${this.id}`);
        for (let neighbor of this.neighbors) {
            if (neighbor.id !== sourceId) {
                neighbor.receivePacket(destination, message, ttl - 1, this.id);
            }
        }
    }

        /**
     * receivePacket: Recibe un paquete de un destino especifico
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     * @param {Int} ttl : Time to live
     * @param {String} sourceId : Identificador del router que envió el paquete
     */
    receivePacket(destination, message, ttl, sourceId) {
        if (destination === this.id) {
            console.log(`Received message at Router ${this.id}: ${message}`);
        } else {
            this.forwardPacket(destination, message, ttl, sourceId);
        }
    }
}

// Create instances of routers
const routerA = new Router("A");
const routerB = new Router("B");
const routerC = new Router("C");
const routerD = new Router("D");
const routerE = new Router("E");
const routerF = new Router("F");
const routerG = new Router("G");
const routerH = new Router("H");

// Establish neighbor relationships
routerA.addNeighbor(routerB);
routerA.addNeighbor(routerC);
routerB.addNeighbor(routerA);
routerB.addNeighbor(routerD);
routerC.addNeighbor(routerA);
routerC.addNeighbor(routerD);
routerC.addNeighbor(routerE);
routerD.addNeighbor(routerB);
routerD.addNeighbor(routerC);
routerD.addNeighbor(routerF);
routerE.addNeighbor(routerC);
routerE.addNeighbor(routerF);
routerF.addNeighbor(routerD);
routerF.addNeighbor(routerE);
routerF.addNeighbor(routerG);
routerG.addNeighbor(routerF);
routerG.addNeighbor(routerH);
routerH.addNeighbor(routerG);

// Send a packet from RouterA to RouterH with TTL 4 and the message "Hello H!"
routerA.sendPacket("H", "Hello H!", 4);