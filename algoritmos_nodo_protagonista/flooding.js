const Node = require('./Nodo.js');

function flooding(startNode) {
    let queue = [{ node: startNode, path: [startNode.id], cost: 0 }];
    let paths = {};

    while (queue.length > 0) {
        let current = queue.shift();
        let currentNode = current.node;
        let currentPath = current.path;
        let currentCost = current.cost;

        let neighbors = currentNode.getNeighbors();
        for (let neighbor of neighbors) {
            let neighborNode = neighbor.node;
            if (!currentPath.includes(neighborNode.id)) {
                queue.push({
                    node: neighborNode,
                    path: [...currentPath, neighborNode.id],
                    cost: currentCost + neighbor.weight
                });
            }
        }

        if (!paths[currentNode.id]) {
            paths[currentNode.id] = [];
        }
        paths[currentNode.id].push({ path: currentPath, cost: currentCost });
    }

    return paths;
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

const solucion_flooding = flooding(nodes[0]);
console.dir(solucion_flooding, { depth: null });