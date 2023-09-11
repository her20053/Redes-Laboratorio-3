/**
 * dijkstra: Implementa el algoritmo de Dijkstra para encontrar el camino más corto
 * @param {string} source - El nodo de origen
 * @param {object} names - Un diccionario que asigna nombres de nodos a JIDs
 * @param {string} destination - El nodo de destino
 */
function dijkstra(source, names, destination) {
    const nodes = Object.keys(names);
    const distances = {};
    const previousNodes = {};
    const unvisitedNodes = new Set(nodes);

    // Inicializa todas las distancias con infinito, excepto el nodo de origen
    for (let node of nodes) {
        distances[node] = node === source ? 0 : Infinity;
    }

    // Realiza el bucle principal del algoritmo
    while (unvisitedNodes.size > 0) {
        const currentNode = obtenerNodoMasCercano(unvisitedNodes, distances);
        unvisitedNodes.delete(currentNode);

        // Explora los vecinos del nodo actual
        for (let neighbor of nodes) {
            // Verifica si el nodo vecino es adyacente y no ha sido visitado aún
            if (nodeEsVecino(currentNode, neighbor, names) && unvisitedNodes.has(neighbor)) {
                const distance = obtenerPesoDelEnlace(currentNode, neighbor, names);
                const totalDistance = distances[currentNode] + distance;

                // Actualiza la distancia si encontramos un camino más corto
                if (totalDistance < distances[neighbor]) {
                    distances[neighbor] = totalDistance;
                    previousNodes[neighbor] = currentNode;
                }
            }
        }
    }

    // Reconstruye el camino desde el nodo de destino al nodo de origen
    const path = [destination];
    let currentNode = destination;
    while (previousNodes[currentNode]) {
        path.push(previousNodes[currentNode]);
        currentNode = previousNodes[currentNode];
    }
    path.reverse();

    return path;
}

/**
 * obtenerNodoMasCercano: Función auxiliar para encontrar el nodo no visitado con la distancia más pequeña
 * @param {Set} unvisitedNodes - Conjunto de nodos no visitados
 * @param {Object} distances - Objeto que contiene las distancias a cada nodo
 */
function obtenerNodoMasCercano(unvisitedNodes, distances) {
    let nodoMasCercano = null;
    for (let node of unvisitedNodes) {
        if (nodoMasCercano === null || distances[node] < distances[nodoMasCercano]) {
            nodoMasCercano = node;
        }
    }
    return nodoMasCercano;
}

/**
 * nodeEsVecino: Comprueba si dos nodos son vecinos
 * @param {string} node1 - Primer nodo
 * @param {string} node2 - Segundo nodo
 * @param {object} names - Un diccionario que asigna nombres de nodos a JIDs
 */
function nodeEsVecino(node1, node2, names) {
    return names[node1] && names[node2];
}

/**
 * obtenerPesoDelEnlace: Obtiene el peso del enlace entre dos nodos
 * @param {string} node1 - Primer nodo
 * @param {string} node2 - Segundo nodo
 * @param {object} names - Un diccionario que asigna nombres de nodos a JIDs
 */
function obtenerPesoDelEnlace(node1, node2, names) {
    // Modifica esta función para obtener el peso del enlace desde tus datos de topología según sea necesario
    // Aquí, asumo un peso predeterminado de 1 para simplificar
    return 1;
}

module.exports = {
    dijkstra,
};
