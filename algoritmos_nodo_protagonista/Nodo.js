class Node {

    constructor(id, data = {}) {
        this.id = id;
        this.data = data;
        this.neighbors = [];
        this.routing_table = {};
    }

    listen(event) {

        console.log(`Escuchando en ${this.id}`);

        // Escuchar mensajes (Harcodeado por el momento, posteriormente escuchara por sockets)

        if (event.type === 'message') {
            this._message(event);
        }

        else if (event.type === 'info') {
            this._info(event);
        }

        else if (event.type === 'assemble') {
            this._assembleDijkstra(event);
        }

        else {
            console.log(`Evento no reconocido: ${event.type}`);
        }


    }

    _message(event) {

        // {
        //     “type” : ”message”,
        //     “headers” : [“from” : ”A”, “to” : ”F”, “hop_count” : 0, ...],
        //     “payload” : “Hola mundo”
        // }

        console.log(`Mensaje recibido en ${this.id}`);

        // Verificar si el mensaje es para mi
        if (event.headers.to === this.id) {
            console.log(`Mensaje para mi: ${event.payload}`);
        }

        // Si no es para mi, reenviar
        else {
            // Incrementar el hop_count
            event.headers.hop_count++;

            // Buscar el nodo al que hay que reenviar
            let next_node = this.routing_table[event.headers.to];

            // Reenviar el mensaje
            next_node.listen(event);
        }

    }

    _info(event) {

        // {
        //     “type” : ”info”,
        //     “headers” : [“from” : ”A”, “to” : ”B”, “hop_count” : 0, ...],
        //     “payload” : “[0, 1, 1, 0, 0, 0, 0, 0, 1]”
        // }

        console.log(`Información recibida en ${this.id}`);



    }

    addNeighbor(node, weight) {
        this.neighbors.push({ node, weight });
    }

    getNeighbors() {
        return this.neighbors;
    }

    setRoutingTable(routing_table) {
        this.routing_table = routing_table;
    }

    getRoutingTable() {
        return this.routing_table;
    }
}

module.exports = Node;