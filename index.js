const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceKey.json");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASSWORD}@allunityit.looszdp.mongodb.net/?appName=AllUnityIt`;
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASSWORD}@allunityit.looszdp.mongodb.net/?appName=AllUnityIt`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('ARTIFYDB');
    const addArtworkCollection = db.collection('addArtwork');
    const addFavoritesCollection = db.collection('favoriteArt');

    // app.post("/addArtwork", async (req, res) => {
    //   const newUser = req.body;
    //   newUser.createdAt = new Date();
    //   const result = await addArtworkCollection.insertOne(newUser);
    //   res.send(result);
    // });

    // ----------------- ADD NEW ARTWORK -----------------
    app.post("/addArtwork", async (req, res) => {
      try {
        const newArtwork = req.body;

        if (!newArtwork || Object.keys(newArtwork).length === 0) {
          return res.status(400).send({ error: "Request body is missing" });
        }

        newArtwork.createdAt = new Date();
        const result = await addArtworkCollection.insertOne(newArtwork);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server error" });
      }
    });

    // app.get("/addArtwork", async (req, res) => {
    //   const result = await addArtworkCollection.find().toArray();
    //   res.send(result);
    // });

    // ----------------- GET ALL ARTWORK -----------------
    app.get("/addArtwork", async (req, res) => {
      const result = await addArtworkCollection.find().toArray();
      res.send(result);
    });

    // app.get('/addArtwork/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await addArtworkCollection.findOne({ _id: new ObjectId(id) });
    //   res.send(result);
    // });

    // ----------------- GET SINGLE ARTWORK BY ID -----------------
    app.get('/addArtwork/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const artwork = await addArtworkCollection.findOne({ _id: new ObjectId(id) });
        if (!artwork) return res.status(404).send({ error: "Artwork not found" });
        res.send(artwork);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server error" });
      }
    });

    // app.get('/latest-addArtwork', async (req, res) => {
    //   const result = await addArtworkCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
    //   res.send(result);
    // });

    // ----------------- GET LATEST ARTWORK -----------------
    app.get('/latest-addArtwork', async (req, res) => {
      const result = await addArtworkCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
      res.send(result);
    });

    // app.post("/likes/:id", async (req, res) => {
    //   const { userEmail } = req.body;
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const artwork = await addArtworkCollection.findOne(filter);

    //   if (!artwork) {
    //     return res.status(404).send({ message: "Artwork not found" });
    //   }

    //   let update;

    //   if (artwork.likedBy?.includes(userEmail)) {
    //     update = { $inc: { likes: -1 }, $pull: { likedBy: userEmail } };
    //   } else {
    //     update = { $inc: { likes: 1 }, $push: { likedBy: userEmail } };
    //   }

    //   await addArtworkCollection.updateOne(filter, update);
    //   const updatedArtwork = await addArtworkCollection.findOne(filter);

    //   res.send({ success: true, likes: updatedArtwork.likes });
    // });

    // ----------------- LIKE / UNLIKE ARTWORK -----------------
    app.post("/likes/:id", async (req, res) => {
      try {
        const { userEmail } = req.body;
        const id = req.params.id;

        if (!userEmail) return res.status(400).send({ error: "User email is required" });

        const filter = { _id: new ObjectId(id) };
        const artwork = await addArtworkCollection.findOne(filter);
        if (!artwork) return res.status(404).send({ error: "Artwork not found" });

        let update;
        if (artwork.likedBy?.includes(userEmail)) {
          update = { $inc: { likes: -1 }, $pull: { likedBy: userEmail } };
        } else {
          update = { $inc: { likes: 1 }, $push: { likedBy: userEmail } };
        }

        await addArtworkCollection.updateOne(filter, update);
        const updatedArtwork = await addArtworkCollection.findOne(filter);
        res.send({ success: true, likes: updatedArtwork.likes });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server error" });
      }
    });

    // app.post('/favoriteArt', async (req, res) => {
    //   const data = req.body;
    //   const result = await addFavoritesCollection.insertOne(data);
    //   res.send(result);
    // });

    app.post('/favoriteArt', async (req, res) => {
      try {
        const data = req.body;

        // ensure no _id is inserted accidentally
        delete data._id;

        const result = await addFavoritesCollection.insertOne(data);
        res.send(result);

      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Insert failed" });
      }
    });


    // // ----------------- FAVORITE ART -----------------
    // app.post('/favoriteArt', async (req, res) => {
    //   try {
    //     const data = req.body;
    //     if (!data || Object.keys(data).length === 0) {
    //       return res.status(400).send({ error: "Request body is missing" });
    //     }
    //     const result = await addFavoritesCollection.insertOne(data);
    //     res.send(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send({ error: "Server error" });
    //   }
    // });

    // app.get('/my-favoriteArt', async (req, res) => {
    //   const email = req.query.email;
    //   const result = await addFavoritesCollection.find({ favorite_by: email }).toArray();
    //   res.send(result);
    // });
    app.get('/my-favoriteArt', async (req, res) => {
      try {
        const result = await addFavoritesCollection.find().toArray();  // ← সব ডাটা
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching favorite artworks", error });
      }
    });


    // app.get('/my-favoriteArt', async (req, res) => {
    //   const email = req.query.email;
    //   const result = await addFavoritesCollection.find({ favorite_by: email }).toArray();
    //   res.send(result);
    // });

    // app.get('/favoriteArt/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await addFavoritesCollection.findOne({ _id: new ObjectId(id) });
    //   res.send(result);
    // });

    app.get('/favoriteArt/:id', async (req, res) => {
      const id = req.params.id;
      const result = await addFavoritesCollection.findOne({ _id:  new ObjectId(id) });
      res.send(result);
    });

    // GET favoriteArt by ID
    app.get('/favoriteArt/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await addFavoritesCollection.find({ _id: new ObjectId(id) });
        if (!result) return res.status(404).json({ error: "Favorite art not found" });

        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.delete('/favoriteArt/:id', async (req, res) => {
      const id = req.params.id;
      const result = await addFavoritesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // DELETE favoriteArt by ID
    // app.delete('/favoriteArt/:id', async (req, res) => {
    //   try {
    //     const id = req.params.id;
    //     if (!isValidObjectId(id)) {
    //       return res.status(400).json({ error: "Invalid ID format" });
    //     }

    //     const result = await addFavoritesCollection.deleteOne({ _id: new ObjectId(id) });
    //     if (result.deletedCount === 0) {
    //       return res.status(404).json({ error: "Favorite art not found" });
    //     }

    //     res.status(200).json({ message: "Favorite art deleted successfully" });
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: "Server error" });
    //   }
    // });

    // app.delete('/favoriteArt/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await addFavoritesCollection.deleteOne({ _id: id });
    //   res.send(result);
    // });

    app.get('/my-gallery', async (req, res) => {
      const email = req.query.email;
      const result = await addArtworkCollection.find({ email }).toArray();
      res.send(result);
    });

    app.put('/addArtwork/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const result = await addArtworkCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );

      res.send(result);
    });

    // app.delete('/addArtwork/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await addArtworkCollection.deleteOne({ _id: new ObjectId(id) });
    //   res.send(result);
    // });


    // // ----------------- MY GALLERY -----------------
    // app.get('/my-gallery', async (req, res) => {
    //   const email = req.query.email;
    //   const result = await addArtworkCollection.find({ email }).toArray();
    //   res.send(result);
    // });

    // app.get('/my-gallery', async (req, res) => {
    //   try {
    //     const email = req.query.email;
    //     if (!email) {
    //       return res.status(400).json({ error: "Email query parameter is required" });
    //     }

    //     const result = await addArtworkCollection.find({ email }).toArray();
    //     res.status(200).json(result);
    //   } catch (error) {
    //     console.error("Error fetching gallery:", error);
    //     res.status(500).json({ error: "Internal server error" });
    //   }
    // });
    // ----------------- UPDATE ARTWORK -----------------

    app.put('/addArtwork/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
          return res.status(400).send({ error: "Request body is missing" });
        }

        const result = await addArtworkCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: data }
        );
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server error" });
      }
    });

    // app.delete('/addArtwork/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const result = await addArtworkCollection.deleteOne({ _id: new ObjectId(id) });
    //   res.send(result);
    // });

    app.delete('/addArtwork/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await addArtworkCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Artwork not found" });
        }

        res.send({ message: "Artwork deleted successfully" });

      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal server error" });
      }
    });


    //     // ----------------- SEARCH ARTWORK -----------------
    //     app.get('/search', async (req, res) => {
    //       const search = req.query.search;
    //       const result = await addArtworkCollection.find({
    //         title: { $regex: search, $options: "i" }
    //       }).toArray();

    //       res.send(result);
    //     });

    //     console.log("MongoDB Connected Successfully");
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   await client.db("admin").command({ ping: 1 });
    //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // }


    // run().catch(console.dir);

    // ----------------- SEARCH ARTWORK -----------------
    app.get('/search', async (req, res) => {
      const search = req.query.search;
      const result = await addArtworkCollection.find({
        title: { $regex: search, $options: "i" }
      }).toArray();
      res.send(result);
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log(error);
  }

  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);


// app.listen(port, () => {
//   console.log(`ARTIFY server running at http://localhost:${port}`);
// });

// ----------------- START SERVER -----------------
app.listen(port, () => {
  console.log(`ARTIFY server running at http://localhost:${port}`);
});

