class Router {
    constructor(id) {
        this.id = id;
        this.routingTable = {};
        this.nextHop = {};
        this.routingTable[id] = 0; // Distancia a sí mismo es 0
        this.nextHop[id] = id; // La siguiente parada para sí mismo es él mismo
    }

    updateRoutingTable(neighborId, neighborRoutingTable) {
        let updated = false;
        for (let [dest, cost] of Object.entries(neighborRoutingTable)) {
            if (
                !this.routingTable.hasOwnProperty(dest) ||
                this.routingTable[dest] > this.routingTable[neighborId] + cost
            ) {
                this.routingTable[dest] = this.routingTable[neighborId] + cost;
                this.nextHop[dest] = neighborId; // Actualizar la siguiente parada
                updated = true;
            }
        }
        return updated;
    }

    sendRoutingTable(neighbors) {
        for (let neighbor of neighbors) {
            if (neighbor.updateRoutingTable(this.id, this.routingTable)) {
                console.log(`Updated routing table of Router ${neighbor.id}`);
            }
        }
    }

    printRoutingTable() {
        console.log(`Routing table for Router ${this.id}:`);
        for (let [dest, cost] of Object.entries(this.routingTable)) {
            console.log(`Destination: ${dest}, Cost: ${cost}, Next Hop: ${this.nextHop[dest]}`);
        }
    }

    getNextHop(destination) {
        return this.nextHop[destination];
    }
}

// Crear instancias de routers
const routerA = new Router("A");
const routerB = new Router("B");
const routerC = new Router("C");

// Hardcodear información inicial de enrutamiento
routerA.updateRoutingTable("A", { A: 0, B: 1, C: 4 });
routerB.updateRoutingTable("B", { A: 1, B: 0, C: 2 });
routerC.updateRoutingTable("C", { A: 4, B: 2, C: 0 });

// Imprimir tablas de enrutamiento iniciales
routerA.printRoutingTable();
routerB.printRoutingTable();
routerC.printRoutingTable();

// Simular el envío de información de enrutamiento
routerA.sendRoutingTable([routerB, routerC]);
routerB.sendRoutingTable([routerA, routerC]);
routerC.sendRoutingTable([routerA, routerB]);

// Imprimir tablas de enrutamiento actualizadas
routerA.printRoutingTable();
routerB.printRoutingTable();
routerC.printRoutingTable();

console.log(routerA.getNextHop("C")); // Devuelve "B"