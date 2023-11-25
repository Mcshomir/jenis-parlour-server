require('dotenv').config();
const express = require('express');

const jwt = require("jsonwebtoken");
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.static("public"));
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lsgnws9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("unauthorization access")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "forbidden access" })
        }
        req.decoded = decoded;
        next()

    })
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        // Send a ping to confirm a successful connection
        const jerinsCollection = client.db("jerinsPortalData").collection("jerinsData")
        const treatmentCollection = client.db("jerinsPortalData").collection("treatmentName");
        const bookingTreatmentCollection = client.db("jerinsPortalData").collection("booking");
        // const bookingCollection = client.db("jerinsPortalData").collection("booking");
        const servicesCollection = client.db("jerinsPortalData").collection("services");
        app.post('/user', async (req, res) => {
            const email = req.body;
            const result = await jerinsCollection.insertOne(email);
            res.send(result);
        })
        app.get('/user', async (req, res) => {
            const query = {};
            const result = await jerinsCollection.find(query).toArray()
            res.send(result);


        })
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await jerinsCollection.findOne(filter)
            res.send(result);


        })
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await jerinsCollection.deleteOne(filter)
            res.send(result);
        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await jerinsCollection.findOne(query);
            console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
                console.log("token", token);
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: " " })
        })

        // app.get('/treatment', async (req, res) => {
        //     const query = {}
        //     const filter = await treatmentCollection.find(query).project({ name: 1, _id: 0 }).toArray()
        //     res.send(filter)
        // })

        app.get('/services', async (req, res) => {
            const query = {}
            console.log("token jwt", req.headers.authorization)
            const filter = await treatmentCollection.find(query).toArray()
            res.send(filter)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await treatmentCollection.findOne(query);
            res.send(result);
        })
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const query = await treatmentCollection.deleteOne(filter)
            res.send(query);

        })
        app.post("/services", async (req, res) => {
            const query = req.body;
            const result = await treatmentCollection.insertOne(query);
            res.send(result);
        })
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const upDoc = {
                $set: { status: done }
            }
            const result = await treatmentCollection.updateOne(query, upDoc)
            res.send(result);
        })

        //// this is booking collection !

        app.post("/booking", async (req, res) => {
            const query = req.body;
            const result = await bookingTreatmentCollection.insertOne(query);
            res.send(result);
        })
        app.get('/booking', async (req, res) => {
            const query = {}

            const filter = await bookingTreatmentCollection.find(query).toArray();
            res.send(filter);

        })
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await bookingTreatmentCollection.findOne(filter)
            res.send(result)
        })
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await bookingTreatmentCollection.deleteOne(filter)
            res.send(result);
        })



        /// ----------------------------  


        app.post('/pending', async (req, res) => {
            const query = req.body;
            const result = await servicesCollection.insertOne(query);
            res.send(result);

        })


        app.get('/pending', async (req, res) => {
            const query = {}
            const filter = await servicesCollection.find(query).toArray();
            res.send(filter);

        })

        app.get('/pending/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        app.delete('/pending/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await servicesCollection.deleteOne(filter)
            res.send(result);
        })







        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);







app.get('/', async (req, res) => {
    res.send("jerins-parlour is on ")
})
app.listen(port, () => {
    console.log(`server is on ${port} `)
})