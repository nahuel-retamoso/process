const { MongoCRUD } = require('../contenedores/MongoDB.js');
const normalize = require('normalizr').normalize;
const denormalize = require('normalizr').denormalize;
const schema = require('normalizr').schema;
require('dotenv').config();



class MensajesDAO extends MongoCRUD {
    constructor() {
        super({
            url: process.env.MONGO_URL,
            dbName: process.env.MONGO_DB,
            collection: process.env.MONGO_COLLECTION,
        });
        this.authorSchema = new schema.Entity('author', {}, { idAttribute: 'email' });
        this.messageSchema = new schema.Entity('message', { author: this.authorSchema });
    }

    async guardarMensaje(mensaje) {
        try {
            const normalizedData = normalize(mensaje, this.messageSchema);
            await this.create(normalizedData);
        } catch (error) {
            console.log(error);
        }
    }

    async obtenerMensajes() {
        try {
            const mensajes = await this.getAll();
            const denormalizedData = denormalize(mensajes.result, this.messageSchema, mensajes.entities);
            return denormalizedData;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = { MensajesDAO };