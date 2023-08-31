// Importamos el graph y node de algoritmos/grafo.js
const { Graph, Node } = require('./grafo');

function flooding(startNode) {
    let queue = [{ node: startNode, path: [startNode], cost: 0 }];
    let paths = {};

    while (queue.length > 0) {
        let current = queue.shift();
        let currentNode = current.node;
        let currentPath = current.path;
        let currentCost = current.cost;

        let neighbors = graph.nodes.get(currentNode.id).edges;
        for (let neighbor of neighbors) {
            if (!currentPath.includes(neighbor.node)) {
                queue.push({
                    node: neighbor.node,
                    path: [...currentPath, neighbor.node],
                    cost: currentCost + neighbor.weight
                });
            }
        }

        if (!paths[currentNode.id]) {
            paths[currentNode.id] = [];
        }
        paths[currentNode.id].push({ path: currentPath.map(n => n.id), cost: currentCost });
    }

    return paths;
}


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

// console.dir(graph, { depth: null });

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

const solucion_flooding = flooding(nodo_inicio);

console.dir(solucion_flooding[nodo_final.id], { depth: null });