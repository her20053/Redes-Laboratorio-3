/**
 * Algoritmo de vector de distancia
 */

// Importamos el graph y node de algoritmos/grafo.js
const { Graph, Node } = require('./grafo');

/**
 * bellmanFord: Implementación del algoritmo de Bellman-Ford
 * @param {graph} graph 
 * @param {String} startNode 
 * @param {String} endNode 
 * @returns 
 */
function bellmanFord(graph, startNode, endNode) {
    // Inicializar las distancias y predecesores
    const distances = new Map();
    const predecessors = new Map();

    graph.nodes.forEach((value, key) => {
        distances.set(key, Infinity);
        predecessors.set(key, null);
    });

    distances.set(startNode.id, 0);

    // Relajación de aristas
    for (let i = 0; i < graph.nodes.size - 1; i++) {
        graph.nodes.forEach((value, nodeId) => {
            const nodeInfo = graph.nodes.get(nodeId);
            const nodeDist = distances.get(nodeId);

            nodeInfo.edges.forEach(edge => {
                const neighbor = edge.node;
                const weight = edge.weight;

                if (nodeDist + weight < distances.get(neighbor.id)) {
                    distances.set(neighbor.id, nodeDist + weight);
                    predecessors.set(neighbor.id, nodeId);
                }
            });
        });
    }

    // Verificar ciclos negativos (opcional)
    graph.nodes.forEach((value, nodeId) => {
        const nodeInfo = graph.nodes.get(nodeId);
        const nodeDist = distances.get(nodeId);

        nodeInfo.edges.forEach(edge => {
            const neighbor = edge.node;
            const weight = edge.weight;

            if (nodeDist + weight < distances.get(neighbor.id)) {
                console.error("Graph contains a negative-weight cycle");
                return null;
            }
        });
    });

    // Reconstruir el camino más corto
    let path = [];
    let currentNode = endNode.id;

    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = predecessors.get(currentNode);
    }

    if (path[0] !== startNode.id) {
        return { path: null, distance: Infinity };
    }

    return { path, distance: distances.get(endNode.id) };
}

// Crear el grafo
const nodes = [];

// Crear los nodos
nodes.push(new Node('NodoA', {})); //0
nodes.push(new Node('NodoB', {})); //1
nodes.push(new Node('NodoC', {})); //2
nodes.push(new Node('NodoD', {})); //3
nodes.push(new Node('NodoE', {})); //4
nodes.push(new Node('NodoF', {})); //5
nodes.push(new Node('NodoG', {})); //6
nodes.push(new Node('NodoH', {})); //7 
nodes.push(new Node('NodoI', {})); //8

// Crear las aristas
const graph = new Graph();

nodes.forEach(node => graph.addNode(node));
//agregar aristas
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

/**
 * buildRoutingTable: Construye la tabla de enrutamiento para un nodo
 * @param {graph} graph : Grafo
 * @param {*} startNode 
 */
function buildRoutingTable(graph, startNode) {
    // Inicializar las distancias y predecesores
    const distances = new Map();
    const predecessors = new Map();
    const nextHop = new Map();

    graph.nodes.forEach((value, key) => {
        distances.set(key, Infinity);
        predecessors.set(key, null);
        nextHop.set(key, null);
    });

    distances.set(startNode.id, 0);

    // Relajación de aristas
    for (let i = 0; i < graph.nodes.size - 1; i++) {
        graph.nodes.forEach((value, nodeId) => {
            const nodeInfo = graph.nodes.get(nodeId);
            const nodeDist = distances.get(nodeId);

            nodeInfo.edges.forEach(edge => {
                const neighbor = edge.node;
                const weight = edge.weight;

                if (nodeDist + weight < distances.get(neighbor.id)) {
                    distances.set(neighbor.id, nodeDist + weight);
                    predecessors.set(neighbor.id, nodeId);

                    // Establecer el nodo siguiente en la ruta (nextHop)
                    nextHop.set(neighbor.id, nodeId === startNode.id ? neighbor.id : nextHop.get(nodeId));
                }
            });
        });
    }

    // Verificar ciclos negativos (opcional)
    graph.nodes.forEach((value, nodeId) => {
        const nodeInfo = graph.nodes.get(nodeId);
        const nodeDist = distances.get(nodeId);

        nodeInfo.edges.forEach(edge => {
            const neighbor = edge.node;
            const weight = edge.weight;

            if (nodeDist + weight < distances.get(neighbor.id)) {
                console.error("Graph contains a negative-weight cycle");
                return null;
            }
        });
    });

    // Imprimir la tabla de enrutamiento
    console.log(`Tabla de enrutamiento para ${startNode.id}:`);
    console.log('Destino \t Siguiente \t Costo');
    graph.nodes.forEach((value, nodeId) => {
        console.log(`${nodeId} \t\t ${nextHop.get(nodeId) || '-'} \t\t ${distances.get(nodeId)}`);
    });
}

// Usar la función para construir e imprimir la tabla de enrutamiento
buildRoutingTable(graph, nodo_inicio);


const result = bellmanFord(graph, nodo_inicio, nodo_final);
console.log("Camino más corto:", result.path);
console.log("Distancia total:", result.distance);
