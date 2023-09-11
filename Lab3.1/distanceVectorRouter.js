/**
 * Simulación de un router que utiliza el algoritmo de vector de distancia para
 */


/**
 * Clase que representa un router
 */
class Router {
    /**
     * constructor: Crea una instancia de la clase Router
     * @param {String} id : Identificador del router
     */
    constructor(id) {
        this.id = id;
        this.routingTable = {};
        this.nextHop = {};
        this.routingTable[id] = 0; // Distancia a sí mismo es 0
        this.nextHop[id] = id; // La siguiente parada para sí mismo es él mismo
    }

    /**
     * loadRoutingTable: Carga la tabla de enrutamiento inicial del router
     * @param {diccionario} routingTable : Diccionario con la tabla de enrutamiento
     */
    loadRoutingTable(routingTable) {
        for (let [dest, cost] of Object.entries(routingTable)) {
            this.routingTable[dest] = cost;
            this.nextHop[dest] = dest;
        }
    }

    /**
     * calculateNextHop: Calcula la siguiente parada para cada destino en la tabla de enrutamiento
     */
    calculateNextHop() {
        for (let dest in this.routingTable) {
            if (dest !== this.id) {
                let minCost = Infinity;
                let nextHopRouter = null;
                for (let neighbor of Object.keys(this.routingTable)) {
                    if (neighbor !== this.id) {
                        const costToNeighbor = this.routingTable[neighbor];
                        const potentialNextHop = costToNeighbor + routers.find((router) => router.id === neighbor).routingTable[dest];
                        if (potentialNextHop < minCost) {
                            minCost = potentialNextHop;
                            nextHopRouter = neighbor;
                        }
                    }
                }
                // console.log(`Next hop for ${dest} is ${nextHopRouter}`)
                this.nextHop[dest] = nextHopRouter; //actualizar la siguiente parada
            }
        }
    }

    /**
     * updateRoutingTable: Actualiza la tabla de enrutamiento del router
     * @param {String} neighborId : Identificador del vecino
     * @param {diccionario} neighborRoutingTable : Tabla de enrutamiento del vecino
     * @returns 
     */
    updateRoutingTable(neighborId, neighborRoutingTable) {
        let updated = false;
        for (let [dest, cost] of Object.entries(neighborRoutingTable)) {
            if (
                !this.routingTable.hasOwnProperty(dest) ||
                this.routingTable[dest] > this.routingTable[neighborId] + cost
            ) {
                this.routingTable[dest] = this.routingTable[neighborId] + cost;
                updated = true;
            }
        }
        if (updated) {
            this.calculateNextHop(); //recaulcular la siguiente parada
        }
        return updated;
    }

    /**
     * sendRoutingTable: Envia la tabla de enrutamiento a los vecinos
     * @param {list} neighbors : Tabla de vecinos
     */
    sendRoutingTable(neighbors) {
        for (let neighbor of neighbors) {
            if (neighbor.updateRoutingTable(this.id, this.routingTable)) {
                console.log(`Updated routing table of Router ${neighbor.id}`);
            }
        }
    }

    /**
     * printRoutingTable: Imprime la tabla de enrutamiento del router
     */
    printRoutingTable() {
        console.log(`Routing table for Router ${this.id}:`);
        for (let [dest, cost] of Object.entries(this.routingTable)) {
            console.log(`Destination: ${dest}, Cost: ${cost}, Next Hop: ${this.nextHop[dest]}`);
        }
    }

    /**
     * getNextHop: Obtiene la siguiente parada para un destino
     * @param {String} destination : Identificador del destino
     * @returns 
     */
    getNextHop(destination) {
        return this.nextHop[destination];
    }

    /**
     * sendPacket: Envia un paquete a un destino
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     */
    sendPacket(destination, message) {
        console.log(`\nSending message from Router ${this.id} to Router ${destination}`)
        const nextHop = this.getNextHop(destination);
        const nextHopRouter = routers.find((router) => router.id === nextHop);
        nextHopRouter.receivePacket(destination, message);
    }

    /**
     * forwardPacket: Reenvia un paquete a un destino
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     */
    forwardPacket(destination, message) {
        const nextHop = this.getNextHop(destination);
        console.log(`Forwarding message from Router ${this.id} to Router ${nextHop}`);
        this.sendPacket(destination, message);
    }

    /**
     * receivePacket: Recibe un paquete de un destino
     * @param {String} destination : Identificador del destino
     * @param {String} message : Mensaje a enviar
     */
    receivePacket(destination, message) {
        if (destination === this.id) {
            console.log(`Received message at Router ${this.id}: ${message}`);
        } else {
            this.forwardPacket(destination, message);
        }
    }
}

// Crear instancias de routers
const routerA = new Router("A");
const routerB = new Router("B");
const routerC = new Router("C");

const routers = [routerA, routerB, routerC];

// Hardcodear información inicial de enrutamiento
routerA.loadRoutingTable({ A: 0, B: 1, C: 4 });
routerB.loadRoutingTable({ A: 1, B: 0, C: 2 });
routerC.loadRoutingTable({ A: 4, B: 2, C: 0 });

// Imprimir tablas de enrutamiento iniciales
routerA.printRoutingTable();
routerB.printRoutingTable();
routerC.printRoutingTable();

// // Simular el envío de información de enrutamiento
routerA.sendRoutingTable([routerB, routerC]);
routerB.sendRoutingTable([routerA, routerC]);
routerC.sendRoutingTable([routerA, routerB]);

// Imprimir tablas de enrutamiento actualizadas
routerA.printRoutingTable();
routerB.printRoutingTable();
routerC.printRoutingTable();

// console.log(routerA.routingTable);
// console.log(routerA.nextHop);
// console.log(routerA.getNextHop("C"));

//simular el envio de mensajes
routerA.sendPacket("C", "Hello, Router C!");