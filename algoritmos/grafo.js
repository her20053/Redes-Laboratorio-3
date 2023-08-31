class Node {
    constructor(id, data = {}) {
        this.id = id;
        this.data = data;
    }
}


class Graph {

    constructor() {
        this.nodes = new Map();
    }

    addNode(node) {
        this.nodes.set(node.id, { node, edges: [] });
    }

    addEdge(node1, node2, weight) {
        this.nodes.get(node1.id).edges.push({ node: node2, weight });
        this.nodes.get(node2.id).edges.push({ node: node1, weight });  // Para grafo no dirigido
    }

    getEdge(node) {
        return this.nodes.get(node.id).edges;
    }

}

// Exportamos la clase
module.exports = { Graph, Node };
