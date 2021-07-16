import { SiteClient } from "datocms-client"

export default async function recebedorDeRequests(req, res) {

    if(req.method === "POST") {
        const TOKEN = "f12068fc4857cbd970f14234f3d505";
        const client = new SiteClient(TOKEN);
    
        const registroCriado = await client.items.create({
            itemType: "968032",
            ...req.body,

            // title: "Comunidade de Teste",
            // imageUrl: "https://github.com/brenogbestrella.png",
            // creatorSlug: "brenogbestrella"
        })
    
        res.json({
            dados: "Algum dado qualquer",
            registroCriado: registroCriado
        })
        return;
    }
    res.status(404).json({
        message: "Ainda não temos nada no GET, mas no POST tem!"
    })
}