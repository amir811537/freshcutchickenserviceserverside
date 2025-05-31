const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// amirhossainbc75
// sHiKJoo3fAljOTPP

// midewaare
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3yb9d5d.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("productDB").collection("products");
    const cartCollection = client.db("productDB").collection("cart");
    // user collection
    const usercollection = client.db("productDB").collection("user");
    const orderCollection=client.db('productDB').collection('order')
    const orderHistoryCollection=client.db('productDB').collection('orderhistory')
    const bannerCollection=client.db('productDB').collection('banner')
    const cmsCollection=client.db('productDB').collection('cms')


// adding banner 
   app.post("/banner", async (req, res) => {
      const banner = req.body;
      // console.log('get product',product)
      const result = await bannerCollection.insertOne(banner);
      res.send(result);
    });

    // getting banner 
    app.get("/banner", async (req, res) => {
      const cursor = bannerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
// PATCH - partial update of banner by ID
app.patch("/banner/:id", async (req, res) => {
  const id = req.params.id;
  const updateFields = req.body;

  try {
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updateFields };

    const result = await bannerCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update banner", error });
  }
});



    //ADDING PRODUCTS
    app.post("/products", async (req, res) => {
      const product = req.body;
      // console.log('get product',product)
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    //getting products
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    
 // Update a product by ID
app.patch("/products/:id", async (req, res) => {
  const id = req.params.id;
  const updatedProduct = req.body;

  try {
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        name: updatedProduct.name,
        price: updatedProduct.price,
        oldPrice: updatedProduct.oldPrice,
        quantity: updatedProduct.quantity,
        sellCount: updatedProduct.sellCount,
        category: updatedProduct.category,
        image: updatedProduct.image,
        categoryImage: updatedProduct.categoryImage,
        description: updatedProduct.description,
      },
    };

    const result = await productCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update product", error: error.message });
  }
});

  

    // get singel product by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });


    // delete a data
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

   // user related API post
app.post("/users", async (req, res) => {
  const user = req.body;
  // Check if the user already exists by email
  const existingUser = await usercollection.findOne({ email: user.email });
  if (existingUser) {
    // If user exists, don't insert again
    return res.status(200).send({ message: "User already exists", inserted: false });
  }
  // Insert new user
  const result = await usercollection.insertOne(user);
  res.send({ message: "User inserted", inserted: true, result });
});



app.get("/users/:email", async (req, res) => {
  const email = req.params.email.toLowerCase();
  console.log("Looking up user by email:", email);
  const user = await usercollection.findOne({ email });
  if (user) {
    console.log("User found:", user);
    res.send(user);
  } else {
    console.log("User NOT found.");
    res.status(404).send({ message: "User not found" });
  }
});

//  user delete 
app.delete('/users/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result= await usercollection.deleteOne(query);
  res.send(result);
})

// get all user 
app.get("/users", async (req, res) => {
  const users = await usercollection.find().toArray();
  res.send(users);
});

// update user 
app.patch("/users/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await usercollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );

  res.send(result);
});


// cart collection 
  //user post to cart
  app.post("/cart", async (req, res) => {
    const cart = req.body;
    // console.log('get product',product)
    const result = await cartCollection.insertOne(cart);
    res.send(result);
  });
// get all cart product 
// app.get("/cart", async (req, res) => {
//   const cursor = cartCollection.find();
//   const result = await cursor.toArray();
//   res.send(result);
// });
// Get cart products by user email
app.get("/cart", async (req, res) => {
  const email = req.query.email;
  const query = email ? { email } : {};
  const cursor = cartCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

app.delete("/cart", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send({ message: "Email is required" });
  const result = await cartCollection.deleteMany({ email });
  res.send(result);
});


// cart delete 
app.delete("/cart/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});
// cart update 
app.patch("/cart/:id", async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { quantity }
  };
  const result = await cartCollection.updateOne(filter, updateDoc);
  res.send(result);
});


// Order apis
  //user post orders
  app.post("/order", async (req, res) => {
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.send(result);
  });
//   app.get("/order", async (req, res) => {
//   const cursor = orderCollection.find();
//   const result = await cursor.toArray();
//   res.send(result);
// });
app.get("/order", async (req, res) => {
  const email = req.query.email;
  const query = email ? { "customer.email": email } : {};
  const cursor = orderCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
  ;
});

// patch api 
app.patch("/order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: status } }
    );

    if (result.modifiedCount === 1) {
      res.send({ success: true, message: "Order status updated" });
    } else {
      res.status(404).send({ success: false, message: "Order not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating order", error });
  }
});
// delete order 
app.delete("/order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await orderCollection.deleteOne({ _id: new ObjectId(orderId) });

    if (result.deletedCount === 1) {
      res.send({ success: true, message: "Order deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "Order not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Error deleting order", error });
  }
});

  // ✅ POST to order history
  app.post('/orderhistory', async (req, res) => {
    const historyData = req.body;
    const result = await orderHistoryCollection.insertOne(historyData);
    res.send(result);
  });
  

  // ✅ GET all order history
  app.get('/orderhistory', async (req, res) => {
    const result = await orderHistoryCollection.find().toArray();
    res.send(result);
  });


// cms app apis 
  app.post("/cms", async (req, res) => {
    const cms = req.body;
    const result = await cmsCollection.insertOne(cms);
    res.send(result);
  });
  
  app.get('/cms', async (req, res) => {
    const result = await cmsCollection.find().toArray();
    res.send(result);
  });

  app.patch("/cms/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    const result = await cmsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Update failed", error });
  }
});
// delete 
app.delete("/cms/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await cmsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Delete failed", error });
  }
});


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});
