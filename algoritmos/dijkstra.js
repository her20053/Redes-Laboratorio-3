/**
 * Algoritmo de Dijkstra
 */

// Importamos el graph y node de algoritmos/grafo.js
const { Graph, Node } = require('./grafo');

/**
 * dijkstra: Implementación del algoritmo de Dijkstra
 * @param {String} startNode 
 * @returns 
 */
function dijkstra(startNode) {
    let distances = {};
    let visited = new Set();
    let predecessors = {};

    for (let nodeEntry of graph.nodes.values()) {
        let node = nodeEntry.node;
        distances[node.id] = Infinity;
        predecessors[node.id] = null;
    }
    distances[startNode.id] = 0;

    while (visited.size !== graph.nodes.size) {
        let nodeToVisit = null;

        for (let nodeEntry of graph.nodes.values()) {
            let node = nodeEntry.node;
            if (nodeToVisit === null || distances[node.id] < distances[nodeToVisit.id]) {
                if (!visited.has(node.id)) {
                    nodeToVisit = node;
                }
            }
        }

        visited.add(nodeToVisit.id);

        let neighbors = graph.nodes.get(nodeToVisit.id).edges;
        for (let neighbor of neighbors) {
            let alternatePath = distances[nodeToVisit.id] + neighbor.weight;
            if (alternatePath < distances[neighbor.node.id]) {
                distances[neighbor.node.id] = alternatePath;
                predecessors[neighbor.node.id] = nodeToVisit.id;
            }
        }
    }

    let routes = {};
    for (let nodeEntry of graph.nodes.values()) {
        let node = nodeEntry.node;
        routes[node.id] = {
            distance: distances[node.id],
            path: _buildPath(predecessors, startNode.id, node.id)
        };
    }

    return routes;
}

/**
 * _buildPath: Construye el camino más corto
 * @param {String} predecessors : predecesores
 * @param {String} startNode : origen
 * @param {String} endNode : destino
 * @returns 
 */
function _buildPath(predecessors, startNode, endNode) {
    let path = [endNode];
    while (path[path.length - 1] !== startNode) {
        path.push(predecessors[path[path.length - 1]]);
    }
    return path.reverse();
}

// Ejemplo
const nodes = [];

nodes.push(new Node('NodoA', {})); //0
nodes.push(new Node('NodoB', {})); //1
nodes.push(new Node('NodoC', {})); //2
nodes.push(new Node('NodoD', {})); //3
nodes.push(new Node('NodoE', {})); //4
nodes.push(new Node('NodoF', {})); //5
nodes.push(new Node('NodoG', {})); //6
nodes.push(new Node('NodoH', {})); //7 
nodes.push(new Node('NodoI', {})); //8


const graph = new Graph();

nodes.forEach(node => graph.addNode(node));

graph.addEdge(nodes[0], nodes[1], 7);
graph.addEdge(nodes[0], nodes[8], 1);
graph.addEdge(nodes[0], nodes[2], 7);
graph.addEdge(nodes[8], nodes[3], 6);
graph.addEdge(nodes[2], nodes[3], 5);
graph.addEdge(nodes[3], nodes[5], 1);
graph.addEdge(nodes[5], nodes[7], 4);
graph.addEdge(nodes[5], nodes[6], 3);
graph.addEdge(nodes[6], nodes[4], 4);
graph.addEdge(nodes[3], nodes[4], 1);
graph.addEdge(nodes[5], nodes[1], 2);

console.dir(graph, { depth: null });

const payload = {
    type: "message",
    headers: {
        from: "A",
        to: "F",
        hop_count: 0
    },
    payload: "Hola mundo"
};

let nodo_inicio = nodes[0];

let nodo_final = nodes[4];

// NODO FINAL SE PUEDE SETEAR AUTOMATICAMENTE DEPENDIENDO SI SOMOS LOS SENDERS O LOS RECEIVERS

// NOSOTROS NO PODEMOS DEVOLVER UN MENSAJE A UN NODO QUE NOS HA ENVIADO UN MENSAJE


const solucion_dijksta = dijkstra(nodo_inicio);

console.dir(solucion_dijksta, { depth: null });

function generateDijkstraTable(dijkstraResult) {
    // Inicializamos la tabla con la fila de encabezado
    let table = "| Nodo   | Distancia | Recorrido   \n";
    table += "|--------|-----------|-------------\n";

    // Iteramos sobre cada nodo en el resultado de Dijkstra
    for (const [node, value] of Object.entries(dijkstraResult)) {
        const distance = value.distance;
        const path = value.path.join(' → ');

        // Agregamos una fila para cada nodo
        table += `| ${node.padEnd(6)} | ${distance.toString().padEnd(9)} | ${path.padEnd(11)}\n`;
    }

    return table;
}

const table = generateDijkstraTable(solucion_dijksta);
console.log(table);

const ruta_optima = solucion_dijksta[nodo_final.id].path;

// SI EL MENSAJE NO ES PARA NOSOTROS, LO ENVIAMOS AL SIGUIENTE MAS CERCANO EN NUESTRA TABLA DE RUTAS

console.log("El mensaje se enviara desde " + nodo_inicio.id + " hasta " + nodo_final.id);
console.log("La ruta optima es: " + ruta_optima);
