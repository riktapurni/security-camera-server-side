const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
//Middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gu8vt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        // console.log('connected to database');
        const database = client.db('securityCameraDB');
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders')
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')

        // POST Api for products
        app.post('/addProduct', async(req, res)=>{
           console.log(req.body)
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)
            // console.log("got new newProduct", newProduct) 
            console.log("added newProduct", result); 
            res.send(result); 
        });
        //GET All Products
        app.get('/allproducts', async(req, res)=>{
            const cursor = productCollection.find({})
            const allproducts = await cursor.toArray();
            res.send(allproducts)
        });
        //Get Single product
        
        app.get('/productDetails/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const productDetails = await productCollection.findOne(query)
            console.log("load product with id:", id)
            res.send(productDetails);
            console.log(productDetails);
        });
        //DELETE Product API
        app.delete('/allproducts/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) };
        const result = await productCollection.deleteOne(query)
        //   console.log("deleting order id", result);
        res.json(result)
        });
           // POST Api for Oders
        app.post('/orders', async(req, res)=>{
           console.log(req.body)
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder)
            // console.log("got new order", newOrder) 
            console.log("added order", result); 
            res.json(result); 
        });
        //Get Orders Api
        app.get('/orders', async(req, res)=>{
            const cursor = orderCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders)
        });
        //DELETE Order API
        app.delete('/orders/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) };
        const result = await orderCollection.deleteOne(query)
        //   console.log("deleting order id", result);
        res.json(result)
        });

         //  my order
        app.get("/myOrder/:email", async (req, res) => {
            console.log(req.params.email);
            const result = await orderCollection
            .find({ email: req.params.email })
            .toArray();
            res.send(result);
        });
        // POST Api for users
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user)
            // console.log("got new order", newOrder) 
            console.log("added user", result); 
            res.json(result); 
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //make admin api 
        app.put("/makeAdmin", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await userCollection.find(filter).toArray();
    if (result) {
      const documents = await userCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
      console.log(documents);
    }

  });

  // check admin or not
  app.get("/checkAdmin/:email", async (req, res) => {
    const result = await userCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });
  // check user or not
  app.get("/checkUser/:email", async (req, res) => {
    const result = await userCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });
         // POST Api for Review
        app.post('/reviews', async(req, res)=>{
           console.log(req.body)
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            console.log("added user", result); 
            res.json(result); 
        });

        //Get Review Api
        app.get('/reviews', async(req, res)=>{
            const cursor = reviewCollection.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)
        });
        // Order status update
            app.put("/statusUpdate/:id", async (req, res) => {
                const filter = { _id: ObjectId(req.params.id) };
                console.log(req.params.id);
                const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
                });
                res.send(result);
                console.log(result);
            });

    }//try end
    finally{
        // await client.close();
    }
}//function end
run().catch(console.dir);
app.get('/', (req, res)=>{
    res.send('Running react tourism app server');
});
app.listen (port, ()=>{
    console.log("Running server on port", port)
})