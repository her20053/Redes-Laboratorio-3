/**
 * client.js: cliente de mensajeria instantanea que soporta el protocolo XMPP.
 * Este archivo es el responsable de poder conectarse a alumchat.xyz y poder realizar todas las funcionalidades del chat.
 *
 * @author Jose Hernandez 20053
 * @author Pablo Gonzalez 20362
 * @author Javier Mombiela 20067
 * @created 2023-09-06
 * 
 * @requires xmpp/client
 * @requires xmpp/debug
 * 
 */


// Importar modulos
const { client, xml } = require("@xmpp/client");
const debug = require("@xmpp/debug");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Client: clase que representa al cliente XMPP y todas sus funcionalidades.
 */
class Client {
    constructor() {
        this.username = null;
        this.password = null;
        this.service = "xmpp://alumchat.xyz:5222";
        this.domain = "alumchat.xyz";
        this.xmpp = null;
        this.router = null;
        this.names = {};
        this.topo = {};
    }

    /**
   * login: conecta al cliente XMPP al servidor.
   * @param {String} username
   * @param {String} password
   */
  async login(username, password) {
    // Crear cliente XMPP
    this.username = username;
    this.password = password;
    this.xmpp = client({
      service: this.service,
      domain: this.domain,
      username: this.username,
      password: this.password,
    });
  
    this.xmpp.on("online", async () => {
      await this.xmpp.send(xml("presence"));
    });
    
    // Evento para recibir la respuesta del servidor y conectarse
    try {
      await this.xmpp.start();
      // this.listenForStanzas();
    } catch (err) {
      if (err.condition === 'not-authorized') {
        throw new Error('\nCredenciales incorrectas! Intente de nuevo.');
      } else {
        throw err;
      }
    }
  }

  /**
   * logout: desconecta al cliente XMPP del servidor.
   */
  async logout() {
    if (!this.xmpp) {
      throw new Error("Error en la conexion, intenta de nuevo.");
    }

    // se para la conexion y se reestablecen los valores
    await this.xmpp.stop();
    this.xmpp = null;
    this.username = null;
    this.password = null;
  }

  /**
   * directMessage: envía un mensaje a un destinatario.
   * @param destinatario: nombre de usuario del destinatario.
   * @param mensaje: mensaje que se desea enviar.
   */
  async directMessage(destinatario, mensaje) {
    // const userJId = `${destinatario}@${this.domain}`;
    if (!this.xmpp) {
      throw new Error("Error en la conexion, intenta de nuevo.");
    }

    // Crear la stanza del mensaje
    const messageStanza = xml(
      "message",
      { type: "chat", to: destinatario },
      xml("body", {}, mensaje)
    );

    await this.xmpp.send(messageStanza);
  }

  /**
   * chatMessage: envía un mensaje a un grupo.
   * @param {string} groupName : nombre del grupo al que se desea enviar el mensaje.
   * @param {string} message : mensaje que se desea enviar.
   */
  async chatMessage(groupName, message) {
    const groudJid = `${groupName}@conference.${this.domain}`;
    if (!this.xmpp) {
      throw new Error("Error en la conexion, intenta de nuevo.");
    }

    // Crear la stanza del mensaje de chat
    const messageStanza = xml(
      "message",
      { type: "groupchat", to: groudJid },
      xml("body", {}, message)
    );

    await this.xmpp.send(messageStanza);
  }  

}

module.exports = Client;