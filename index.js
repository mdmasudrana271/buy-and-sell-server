const express = require("express");
const app = express();
const cors = require("cors")
const port = process.env.PORT || 5000;

require("dotenv").config();



const admin = require("firebase-admin");

const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({extended: true}))


async function run(){
    try{

        app.post("/users", async(req, res)=>{
            const user = {
                name: req.body.name,
                email: req.body.email,
            }

            const result = await db.collection("users").add(user)
            res.send(result)
        })

        app.get('/all-users', async (req, res) => {
            
              const snapshot = await db.collection('users').get();
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              res.json(data);
          
          });


          app.post('/all-data', async (req, res) => {
            const data = req.body;
          
            const batch = db.batch();
          
            data.forEach(item => {
              const docRef = db.collection('products').doc();
              batch.set(docRef, item);
            });
            await batch.commit();
            res.json({ message: 'Data saved successfully' });
        });



        app.get('/search', async (req, res) => {
            const query = req.query.search;
            if (!query) {
              return res.status(400).json({ error: 'Search query is required' });
            }

              // Search by name
              let snapshot = await db.collection('products').where('name','==', query).get();
          
              const results = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.name.toLowerCase().includes(query.toLowerCase())) {
                  results.push(data);
                }
              });
          
              // Search by category if no results found by name
              if (results.length === 0) {
                snapshot = await db.collection('products').where('category','==', query).get();
          
                snapshot.forEach((doc) => {
                  const data = doc.data();
                  if (data.category.toLowerCase().includes(query.toLowerCase())) {
                    results.push(data);
                  }
                });
              }
          
              res.json(results);

          });

    }
    finally{

    }
}

run().catch(err=>{
    console.log(err)
})




app.get("/", (req, res)=>{
    res.send('buy and sell server')
})


app.listen(port, ()=>{
    console.log(`buy and sell server running on port ${port}`)
})