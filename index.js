const express = require('express')
const app = express()

var cors = require('cors')
app.use(cors())
require('dotenv').config();

var jwt = require('jsonwebtoken')
const stripe = require('stripe')('sk_test_51NIBLeAvQX3LTKrO5yw3KMpO6QTRPnR5uEPlu1bhS10KJtxBGjPIsYYf2Jcuy6fMuEpTiFb6xNd0wt9xotZTSJoD000XZGGIXa')


app.use(express.json())
const port = process.env.PORT || 5000



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jufhth7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyJWT = (req, res, next) => {
  console.log('hitting verifyJWT');
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(401).send({error: true , message: 'Unauthorized Access'})
  }
  const token = authorization.split(' ')[1];
  
  // verify a token symmetric
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) =>  {
  if (err) {
    return res.status(403).send({error: true , message: 'Token Expired ,, Unauthorized Access'})
  }
  req.decoded = decoded
  next()
  })}
  

async function run() {
  try {
    const Art_Class = client.db("Kids_World");
    const Art_Class_All_Data = Art_Class.collection("Kids_Class"); 
  
    const UserInfo = client.db("Kids_World");
    const UserInfo_All_Data = UserInfo.collection("UserInfo"); 

    const Feedback_Collection = client.db("Kids_World");
    const Feedback_Collection_All_Data = Feedback_Collection.collection("Feedback"); 
    
    const Cart_Collection = client.db("Kids_World");
    const Cart_Collection_All_Data = Cart_Collection.collection("Carts");

    const paymentCollection = client.db("Kids_World").collection("payments");

  app.post('/jwt', async (req, res) => {  
    const user = req.body;
    console.log(user);
    var token = jwt.sign(user , process.env.JWT_SECRET_TOKEN,{ expiresIn: '12h' });
    res.send({token})
  })

app.post('/art_class', async (req, res) => {  
  const art = req.body;
  console.log(art);
  const result = await Art_Class_All_Data.insertOne(art);                                     
  res.send(result)
})


app.get('/art_class', async (req, res) => {   
  const cursor = Art_Class_All_Data.find();
  const result = await cursor.toArray() 
  res.send(result)                                                   
})

app.post('/userInfo', async (req, res) => {  
  const user_data = req.body;
  const query = {email: user_data.email}
  const existing_user = await UserInfo_All_Data.findOne(query);
  if (existing_user) {
    return res.send({message: 'Already Exist'})
  }
  const result = await UserInfo_All_Data.insertOne(user_data);                            
  res.send(result)
})

app.get('/userInfo/instructor/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;

  if (req.decoded.email !== email) {
    console.log(req.decoded.email);
    res.send({ instructor: false })
  }

  const query = { email: email }
  const user = await UserInfo_All_Data.findOne(query);
  const result = { instructor: user?.role === 'instructor' }
  res.send(result);
})
app.get('/instructor', async (req, res) => {   
  
  const cursor = UserInfo_All_Data.find({ role: 'instructor' })
  const result = await cursor.toArray()                                                    
  res.send(result)
})
app.get('/userInfo/admin/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;

  if (req.decoded.email !== email) {
    res.send({ admin: false })
  }

  const query = { email: email }
  const user = await UserInfo_All_Data.findOne(query);
  const result = { admin: user?.role === 'admin' }
  res.send(result);
})
app.get('/userInfo/instructor/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;

  if (req.decoded.email !== email) {
    console.log(req.decoded.email);
    res.send({ instructor: false })                                                    
  }

  const query = { email: email }
  const user = await Art_Class_All_Data.findOne(query);
  const result = { instructor: user?.role === 'instructor' }
  res.send(result);
})
app.get('/art_class_Admin', async (req, res) => {   
  const cursor = Art_Class_All_Data.find();
  const result = await cursor.toArray()                                                    
  res.send(result)
})
app.patch('/art_class/:id', async (req, res) => {
  const id = req.params.id
  const update_Approve = req.body;
  
  const filter = { _id: new ObjectId(id) };                                             
  const update_Approve_Doc = {
    $set: {
      status: update_Approve.status,
    },
  };

  const result = await Art_Class_All_Data.updateOne(filter, update_Approve_Doc);
  res.send(result)
  
})
app.patch('/art_class/:id', async (req, res) => {
  const id = req.params.id
  const update_Deny = req.body;
  
  const filter = { _id: new ObjectId(id) };                                             
  const update_Deny_Doc = {
    $set: {
      status: update_Deny.status,
    },
  };

  const result = await Art_Class_All_Data.updateOne(filter, update_Deny_Doc);
  res.send(result)
  
})
app.patch('/userInfo/instructor/:id', async (req, res) => {
  const id = req.params.id
  
  const filter = { _id: new ObjectId(id) };                                             
  const update_user_data = {
    $set: {
      role: 'instructor'
    },
  };

  const result = await UserInfo_All_Data.updateOne(filter, update_user_data);
  res.send(result)
  // console.log('clear', update_user);
})
app.patch('/userInfo/admin/:id', async (req, res) => {
  const id = req.params.id
  
  const filter = { _id: new ObjectId(id) };                                            
  const update_user_data = {
    $set: {
      role: 'admin'
    },
  };

  const result = await UserInfo_All_Data.updateOne(filter, update_user_data);
  res.send(result)
  // console.log('clear', update_user);
})
app.get('/userInfo',verifyJWT, async (req, res) => {  
  const cursor = UserInfo_All_Data.find();
  const result = await cursor.toArray()                                                   
  res.send(result)
})
app.post('/feedback', async (req, res) => {  
  const feedback = req.body;
  console.log(feedback);
  const result = await Feedback_Collection_All_Data.insertOne(feedback);                            
  res.send(result)
})
app.get('/InstructorsClass/:id', async (req, res) => { 
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await Art_Class_All_Data.findOne(query);
  res.send(result)

})
app.get('/myfeedback',verifyJWT, async(req,res)=>{
  const sort = req.query.sort
  let query = {}
  if(req.query?.email){
    query = {instructor_email: req.query?.email }                                                  //𝐆𝐄𝐓 specific Class data by using email
  }
  const options = {
    sort: {
      price: 1
    }
  }
  const result = await Feedback_Collection_All_Data.find(query,options).toArray()
  res.send(result);
})
app.get('/myclasslist',async(req,res)=>{
  const sort = req.query.sort
  let query = {}
  if(req.query?.email){
    query = {instructor_email: req.query?.email }                                                  //𝐆𝐄𝐓 specific Class data by using email
  }
  const options = {
    sort: {
      price: 1
    }
  }
  const result = await Art_Class_All_Data.find(query,options).toArray()
  res.send(result);
})

app.get('/art_class/:id', async (req, res) => {  
  const id = req.params.id
  const query = { _id: new ObjectId(id) }; 
  const options = {
    
    projection: {instructor: 1, name: 1 ,_id: 1 , instructor_email: 1 , price: 1},
  };                                                                                                 

  const result = await Art_Class_All_Data.findOne(query , options);                                        
  res.send(result)

})
app.put('/updateclass/:id', async (req, res) => {
  const id = req.params.id
  const Update_Class = req.body;
  
  const filter = { _id: new ObjectId(id) };                                            
  const options = { upsert: true };
  const Update_Class_Doc = {
    $set: {
      name: Update_Class.name,
      image: Update_Class.image,
      price: Update_Class.price,
      available_seats: Update_Class.available_seats
    },
  };
  const result = await Art_Class_All_Data.updateOne(filter, Update_Class_Doc, options);
  res.send(result)
  
})
app.post('/usercart', async (req, res) => {  
  const uesrs_cart = req.body;
  console.log(uesrs_cart);
  const result = await Cart_Collection_All_Data.insertOne(uesrs_cart);                 
  res.send(result)
})
app.get('/usercart', verifyJWT,  async (req, res) => {   
      // console.log(req.headers.authorization);
     const decoded = req.decoded
    console.log('came back after verify',decoded);
  if (decoded.email !== req.query.email) {
    return res.status(407).send({error: 1 , message: 'Forbidden Access'})
  }
  
    const email = req.query.email
    if (!email) {
      res.send([])
    }
    const query = {email: email};
    const result = await Cart_Collection_All_Data.find(query).toArray();
      // const result = await cursor.toArray()                                                   
      res.send(result)
    })
    app.delete('/usercart/:id', async (req, res) => {  
      const id = req.params.id
      console.log("deleting id", id);
       
      const query = { _id: new ObjectId(id) };
      const booking = await Cart_Collection_All_Data.deleteOne(query);
      res.send(booking)
    })
    app.get('/userpayment/:id', async (req, res) => { 
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await Cart_Collection_All_Data.findOne(query);
      res.send(result)
    
    })
    
    
     app.post('/create-payment-intent', verifyJWT , async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })
    
    
      // payment related api
      app.post('/payments', verifyJWT, async (req, res) => {
        const payment = req.body;
        const insertResult = await paymentCollection.insertOne(payment);
        // const filter = { _id: new ObjectId(id) };   
        const query = { _id:  new ObjectId(payment.payment_id)  }
        const deleteResult = await Cart_Collection_All_Data.deleteMany(query)
    
        res.send({ insertResult, deleteResult });
      })
      app.get('/payments', async (req, res) => {   
        const cursor = paymentCollection.find();
        const result = await cursor.toArray()                                                    
        res.send(result)
      })
    
    app.get('/mypayment',async(req,res)=>{
      const sort = req.query.sort
      let query = {}
      if(req.query?.email){
        query = {email: req.query?.email }                                                  
      }
      const options = {
        sort: {
          class_price: 1
        }
      }
      const result = await paymentCollection.find(query,options).toArray()
      res.send(result);
    })
    
// Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running')
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

