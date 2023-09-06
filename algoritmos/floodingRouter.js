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
     * floodPacket: Envia un paquete a todos los vecinos excepto al que lo envió
     * @param {String} packet : Paquete a enviar
     * @param {String} sourceId : Identificador del router que envió el paquete
     * @param {INt} ttl : Time to live
     * @returns 
     */
    floodPacket(packet, sourceId, ttl) {
        if (ttl <= 0) {
            console.log(`Packet dropped at Router ${this.id}, TTL expired.`);
            return;
        }

        console.log(`Router ${this.id} received packet: ${packet} from Router ${sourceId} with TTL ${ttl}`);

        for (let neighbor of this.neighbors) {
            if (neighbor.id !== sourceId) {
                neighbor.floodPacket(packet, this.id, ttl - 1);
            }
        }
    }
}

// Crear instancias de routers
const routerA = new Router("A");
const routerB = new Router("B");
const routerC = new Router("C");

// Establecer relaciones de vecindad
routerA.addNeighbor(routerB);
routerA.addNeighbor(routerC);

routerB.addNeighbor(routerA);
routerB.addNeighbor(routerC);

routerC.addNeighbor(routerA);
routerC.addNeighbor(routerB);

// Iniciar el flooding desde el Router A
routerA.floodPacket("Hello World!", null, 3);
``
