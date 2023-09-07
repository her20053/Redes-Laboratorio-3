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
        this.nextHop = {};
        this.neighbors = [];
        this.routingTable = {};
        this.nextHop[id] = id; // La siguiente parada para sí mismo es él mismo
        this.routingTable[id] = 0; // Distancia a sí mismo es 0 o no
    }

    /**
     * addNeighbor: Agrega un vecino al router
     * @param {String} neighbor : Identificador del vecino
     */
    addNeighbor(neighbor) {
        this.neighbors.push(neighbor);
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
        // console.log("\n + updateRoutingTable llamada con:", neighborId, neighborRoutingTable);

        let updated = false;

        // Verificar que el neighborId exista en la tabla de enrutamiento
        if (!this.routingTable.hasOwnProperty(neighborId)) {
            // console.log(`\n + updateRoutingTable Advertencia: ${neighborId} no se encuentra en la tabla de enrutamiento. Ignorando actualización.`);
            return updated;
        }

        const costToNeighbor = this.routingTable[neighborId];

        for (let [dest, cost] of Object.entries(neighborRoutingTable)) {
            // console.log(`\n + updateRoutingTable Procesando destino: ${dest} con costo: ${cost}`);

            const potentialCost = costToNeighbor + cost;

            if (!this.routingTable.hasOwnProperty(dest) || this.routingTable[dest] > potentialCost) {
                if (!this.routingTable.hasOwnProperty(dest)) {
                    // console.log(`\n + updateRoutingTable Destino ${dest} no existe en routingTable. Añadiendo...`);
                } else {
                    // console.log(`\n + updateRoutingTable El costo actual para ${dest} en routingTable es mayor que el costo a través de ${neighborId}. Actualizando...`);
                }
                this.routingTable[dest] = potentialCost;
                updated = true;
            } else {
                // console.log(`\n + updateRoutingTable El costo para ${dest} no necesita actualización.`);
            }
        }

        if (updated) {
            // console.log("\n + updateRoutingTable RoutingTable actualizada. Calculando siguiente parada...");
            // this.calculateNextHop();
        } else {
            // console.log("\n + updateRoutingTable RoutingTable no ha sido actualizada.");
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

module.exports = Router;

// // Crear instancias de routers
// const routerA = new Router("A");
// const routerB = new Router("B");
// const routerC = new Router("C");

// const routers = [routerA, routerB, routerC];

// // Hardcodear información inicial de enrutamiento
// routerA.loadRoutingTable({ A: 0, B: 1, C: 4 });
// routerB.loadRoutingTable({ A: 1, B: 0, C: 2 });
// routerC.loadRoutingTable({ A: 4, B: 2, C: 0 });

// // Imprimir tablas de enrutamiento iniciales
// routerA.printRoutingTable();
// routerB.printRoutingTable();
// routerC.printRoutingTable();

// // // Simular el envío de información de enrutamiento
// routerA.sendRoutingTable([routerB, routerC]);
// routerB.sendRoutingTable([routerA, routerC]);
// routerC.sendRoutingTable([routerA, routerB]);

// // Imprimir tablas de enrutamiento actualizadas
// routerA.printRoutingTable();
// routerB.printRoutingTable();
// routerC.printRoutingTable();

// // console.log(routerA.nextHop);
// // console.log(routerA.getNextHop("C"));

// //simular el envio de mensajes
// routerA.sendPacket("C", "Hello, Router C!");