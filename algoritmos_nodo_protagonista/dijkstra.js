const Node = require('./Nodo.js');

function dijkstra(startNode) {
    let distances = {};
    let visited = new Set();
    let predecessors = {};

    distances[startNode.id] = 0;

    let toVisit = [startNode];  // Cola de nodos para visitar

    while (toVisit.length > 0) {
        // Ordenamos la cola por la distancia más corta
        toVisit.sort((a, b) => distances[a.id] - distances[b.id]);

        // Sacamos el nodo con la distancia más corta de la cola
        let currentNode = toVisit.shift();

        // Lo marcamos como visitado
        visited.add(currentNode.id);

        let neighbors = currentNode.getNeighbors();
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor.node.id)) {
                let alternatePath = distances[currentNode.id] + neighbor.weight;

                // Si encontramos una ruta más corta, actualizamos la distancia y el predecesor
                if (alternatePath < (distances[neighbor.node.id] || Infinity)) {
                    distances[neighbor.node.id] = alternatePath;
                    predecessors[neighbor.node.id] = currentNode.id;

                    // Añadimos el vecino a la cola para visitar
                    toVisit.push(neighbor.node);
                }
            }
        }
    }

    let routes = {};
    for (let id in distances) {
        routes[id] = {
            distance: distances[id],
            path: _buildPath(predecessors, startNode.id, id)
        };
    }

    return routes;
}

function _buildPath(predecessors, startNode, endNode) {
    let path = [endNode];
    while (path[path.length - 1] !== startNode) {
        path.push(predecessors[path[path.length - 1]]);
    }
    return path.reverse();
}

const nodes = [];

nodes.push(new Node('NodoA', {}));
nodes.push(new Node('NodoB', {}));
nodes.push(new Node('NodoC', {}));
nodes.push(new Node('NodoD', {}));
nodes.push(new Node('NodoE', {}));
nodes.push(new Node('NodoF', {}));
nodes.push(new Node('NodoG', {}));
nodes.push(new Node('NodoH', {}));
nodes.push(new Node('NodoI', {}));

nodes[0].addNeighbor(nodes[1], 7);
nodes[0].addNeighbor(nodes[8], 1);
nodes[0].addNeighbor(nodes[2], 7);
nodes[8].addNeighbor(nodes[0], 1);
nodes[8].addNeighbor(nodes[3], 6);
nodes[2].addNeighbor(nodes[0], 7);
nodes[2].addNeighbor(nodes[3], 5);
nodes[3].addNeighbor(nodes[8], 6);
nodes[3].addNeighbor(nodes[2], 5);
nodes[3].addNeighbor(nodes[5], 1);
nodes[3].addNeighbor(nodes[4], 1);
nodes[5].addNeighbor(nodes[3], 1);
nodes[5].addNeighbor(nodes[7], 4);
nodes[5].addNeighbor(nodes[6], 3);
nodes[5].addNeighbor(nodes[1], 2);
nodes[6].addNeighbor(nodes[5], 3);
nodes[6].addNeighbor(nodes[4], 4);
nodes[4].addNeighbor(nodes[3], 1);
nodes[4].addNeighbor(nodes[6], 4);
nodes[7].addNeighbor(nodes[5], 4);
nodes[1].addNeighbor(nodes[0], 7);
nodes[1].addNeighbor(nodes[5], 2);

const solucion_dijkstra = dijkstra(nodes[0]);
console.dir(solucion_dijkstra, { depth: null });

function generateDijkstraTable(dijkstraResult) {
    let table = "| Nodo   | Distancia | Recorrido   \n";
    table += "|--------|-----------|-------------\n";

    for (const [node, value] of Object.entries(dijkstraResult)) {
        const distance = value.distance;
        const path = value.path.join(' → ');

        table += `| ${node.padEnd(6)} | ${distance.toString().padEnd(9)} | ${path.padEnd(11)}\n`;
    }

    return table;
}

const table = generateDijkstraTable(solucion_dijkstra);
console.log(table);

const ruta_optima = solucion_dijkstra['NodoE'].path;

console.log("El mensaje se enviara desde NodoA hasta NodoE");
console.log("La ruta optima es: " + ruta_optima.join(' → '));