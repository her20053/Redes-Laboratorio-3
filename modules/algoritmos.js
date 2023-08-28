class Graph {

    constructor() {
        this.nodes = new Map();
    }

    addNode(node) {
        this.nodes.set(node, []);
    }

    addEdge(node1, node2, weight) {
        this.nodes.get(node1).push({ node: node2, weight: weight });
        this.nodes.get(node2).push({ node: node1, weight: weight });  // Para grafo no dirigido
    }

    dijkstra(startNode) {
        let distances = {};
        let visited = new Set();
        let predecessors = {};  // Aquí guardamos el nodo predecesor de cada nodo

        for (let node of this.nodes.keys()) {
            distances[node] = Infinity;
            predecessors[node] = null;  // Inicializamos todos los predecesores como null
        }
        distances[startNode] = 0;

        while (visited.size !== this.nodes.size) {
            let nodeToVisit = null;

            for (let node in distances) {
                if (nodeToVisit === null || distances[node] < distances[nodeToVisit]) {
                    if (!visited.has(node)) {
                        nodeToVisit = node;
                    }
                }
            }

            visited.add(nodeToVisit);

            let neighbors = this.nodes.get(nodeToVisit);
            for (let neighbor of neighbors) {
                let alternatePath = distances[nodeToVisit] + neighbor.weight;
                if (alternatePath < distances[neighbor.node]) {
                    distances[neighbor.node] = alternatePath;
                    predecessors[neighbor.node] = nodeToVisit;  // Actualizamos el predecesor
                }
            }
        }

        // Ahora construimos el objeto de ruta para cada nodo
        let routes = {};
        for (let node in distances) {
            routes[node] = { distance: distances[node], path: this._buildPath(predecessors, startNode, node) };
        }

        return routes;
    }

    // Función auxiliar para construir la ruta utilizando los predecesores
    _buildPath(predecessors, startNode, endNode) {
        let path = [endNode];
        while (path[path.length - 1] !== startNode) {
            path.push(predecessors[path[path.length - 1]]);
        }
        return path.reverse();
    }


    flooding(startNode) {
        let queue = [{ node: startNode, path: [startNode], cost: 0 }];
        let paths = {};

        while (queue.length > 0) {
            let current = queue.shift();
            let currentNode = current.node;
            let currentPath = current.path;
            let currentCost = current.cost;

            let neighbors = this.nodes.get(currentNode);
            for (let neighbor of neighbors) {
                if (!currentPath.includes(neighbor.node)) {
                    queue.push({
                        node: neighbor.node,
                        path: [...currentPath, neighbor.node],
                        cost: currentCost + neighbor.weight
                    });
                }
            }

            if (!paths[currentNode]) {
                paths[currentNode] = [];
            }
            paths[currentNode].push({ path: currentPath, cost: currentCost });
        }

        return paths;
    }

    distanceVectorRouting(startNode, targetNode) {
        // Inicializar la tabla de enrutamiento para todos los nodos
        let routingTable = {};
        for (let node of this.nodes.keys()) {
            routingTable[node] = {
                distance: node === startNode ? 0 : Infinity,
                nextHop: node === startNode ? startNode : null
            };
        }

        let hasUpdates = true;
        while (hasUpdates) {
            hasUpdates = false;

            for (let currentNode of this.nodes.keys()) {
                for (let neighbor of this.nodes.get(currentNode)) {
                    // Si la distancia a un vecino + la distancia del vecino al destino es menor
                    // que la distancia conocida, actualizamos la tabla de enrutamiento
                    if (routingTable[currentNode].distance + neighbor.weight < routingTable[neighbor.node].distance) {
                        routingTable[neighbor.node].distance = routingTable[currentNode].distance + neighbor.weight;
                        routingTable[neighbor.node].nextHop = currentNode;
                        hasUpdates = true;
                    }
                }
            }
        }

        // Construir la ruta a partir de la tabla de enrutamiento
        let node = targetNode;
        let path = [node];
        while (node !== startNode) {
            node = routingTable[node].nextHop;
            path.unshift(node);
        }

        return {
            path: path,
            distance: routingTable[targetNode].distance
        };
    }





}


const graph = new Graph();

// Agregando nodos
for (let i = 1; i <= 15; i++) {
    graph.addNode(`Nodo${i}`);
}

// Agregando algunas aristas
graph.addEdge('Nodo1', 'Nodo2', 4);
graph.addEdge('Nodo1', 'Nodo3', 2);
graph.addEdge('Nodo2', 'Nodo3', 5);
graph.addEdge('Nodo2', 'Nodo4', 10);
graph.addEdge('Nodo3', 'Nodo5', 3);
graph.addEdge('Nodo4', 'Nodo5', 7);
graph.addEdge('Nodo4', 'Nodo6', 10);
graph.addEdge('Nodo5', 'Nodo7', 3);
graph.addEdge('Nodo6', 'Nodo8', 1);
graph.addEdge('Nodo7', 'Nodo8', 8);
graph.addEdge('Nodo7', 'Nodo9', 4);
graph.addEdge('Nodo8', 'Nodo10', 2);
graph.addEdge('Nodo9', 'Nodo10', 6);
graph.addEdge('Nodo9', 'Nodo11', 4);
graph.addEdge('Nodo10', 'Nodo12', 1);
graph.addEdge('Nodo11', 'Nodo12', 3);
graph.addEdge('Nodo11', 'Nodo13', 2);
graph.addEdge('Nodo12', 'Nodo14', 5);
graph.addEdge('Nodo13', 'Nodo14', 7);
graph.addEdge('Nodo13', 'Nodo15', 4);
graph.addEdge('Nodo14', 'Nodo15', 2);



let nodo_de_inicio = 'Nodo1';
let nodo_de_busqueda = 'Nodo6';

console.log("Utilizando Dijkstra, la ruta optima desde " + nodo_de_inicio + " hasta " + nodo_de_busqueda + " es:");
const dijkstra_solution = graph.dijkstra(nodo_de_inicio);
console.log(dijkstra_solution[nodo_de_busqueda]);

console.log("Utilizando Distance Vector Routing, la ruta desde " + nodo_de_inicio + " hasta " + nodo_de_busqueda + " es:");
const dv_solution = graph.distanceVectorRouting(nodo_de_inicio, nodo_de_busqueda);
console.log(dv_solution);

console.log("Utilizando Flooding, las rutas desde " + nodo_de_inicio + " hasta " + nodo_de_busqueda + " son:");
const flooding_solution = graph.flooding(nodo_de_inicio);
console.dir(flooding_solution[nodo_de_busqueda], { depth: null });