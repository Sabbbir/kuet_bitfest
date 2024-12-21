const express = require("express");
const fs = require("fs");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// userName : kuet_hackathon
// password: 7QpYqa0jDnNA1pHV

const parseRecipes = (filePath) => {
  const data = fs.readFileSync(filePath, "utf-8");
  const recipes = [];
  const lines = data.split("\n");

  let recipe = {};
  lines.forEach((line) => {
    line = line.trim();

    if (!line) {
      // End of a recipe, push it to the array
      if (Object.keys(recipe).length > 0) {
        recipes.push(recipe);
        recipe = {};
      }
      return;
    }

    // Parse fields
    if (line.startsWith("Recipe Name:")) {
      recipe.name = line.split(":")[1].trim();
    } else if (line.startsWith("Ingredients:")) {
      // console.log('line', line.split(":")[1].trim().split(","))
      recipe.ingredients = line
        .split(":")[1]
        .trim()
        .split(", ")
        .map((item) => {
          const [name, quantity] = item.split("-");
          return { name: name.trim(), quantity: quantity.trim() };
        });
    } else if (line.startsWith("Steps:")) {
      recipe.steps = line.split(":")[1].trim();
    } else if (line.startsWith("Taste:")) {
      recipe.taste = line.split(":")[1].trim();
    } else if (line.startsWith("Cuisine Type:")) {
      recipe.cuisineType = line.split(":")[1].trim();
    } else if (line.startsWith("Preparation Time:")) {
      recipe.prepTime = line.split(":")[1].trim();
    } else if (line.startsWith("Reviews:")) {
      recipe.reviews = parseFloat(line.split(":")[1].trim());
    }
  });

  // Push the last recipe if any
  if (Object.keys(recipe).length > 0) {
    recipes.push(recipe);
  }

  return recipes;
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.nhg2oh1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const usersCollection = client.db("kuet_hackathon").collection("users");
    const recipeCollection = client.db("kuet_hackathon").collection("recipes");
    const ingredientsCollection = client
      .db("kuet_hackathon")
      .collection("ingredients");

    app.post("/recipe", async (req, res) => {
      try {
        const filePath = "fav_recipe.txt";
        const recipes = parseRecipes(filePath);

        const existingRecipes = await recipeCollection
          .find({}, { projection: { name: 1 } })
          .toArray();

        const existingNames = new Set(
          existingRecipes.map((recipe) => recipe.name)
        );

        const newRecipes = recipes.filter(
          (recipe) => !existingNames.has(recipe.name)
        );

        if (newRecipes.length === 0) {
          return res.json({
            result: "fail",
            message: "No new recipes to insert, all recipes already exist.",
          });
        }

        const result = await recipeCollection.insertMany(recipes);

        if (result?.insertedIds) {
          res.json({
            result: "success",
            data: JSON.stringify(recipes),
          });
        } else {
          res.json({
            result: "fail",
          });
        }
      } catch (err) {
        console.log(err);
        res.json({
          result: "fail",
        });
      }
    });

    app.post("/ingredients", async (req, res) => {
        const data = req.body;
        data.createdAt = new Date();
        data.updatedAt = new Date();
      //   res.send(data);
      try {
        const isExist = await ingredientsCollection.findOne({
          name: data.name,
        });
        if (isExist) {
          return res.json({
            result: "fail",
            message: "This ingredients is already exist",
          });
        }
        const result = await ingredientsCollection.insertOne(data);
        if (result?.insertedId) {
          res.json({
            result: "success",
            data: data,
          });
        } else {
          res.json({
            result: "fail",
          });
        }
      } catch (err) {
        res.json({
          result: "fail",
        });
      }
    });
      
      app.get("/ingredients", async (req, res) => {
          const result = await ingredientsCollection.find().toArray();
          res.json({
              data: result
          })
      });

      app.get("/recipe", async (req, res) => {
          const result = await recipeCollection.find().toArray();
          res.json({
            data: result,
          });
      })
      
      app.put("/ingredients/:id", async (req, res) => {
          try {
            const data = req.body;
          const ingredientsId = req.params.id;

          const { name, quantity } = data;

          const filter = { _id: new ObjectId(ingredientsId) };

          const updateFields = {};
          if (name) updateFields.name = name;
          if (quantity) updateFields.quantity = quantity;
          updateFields.updatedAt = new Date(); 

          const result = await ingredientsCollection.updateOne(
            filter,
            {
              $set: updateFields
            },
            { upsert: true }
          );
          
          if (result.modifiedCount > 0) {
            res.json({
              result: "success",
                message: `Ingredient '${name}' updated successfully.`,
                data: await ingredientsCollection.findOne(filter)
            });
          } else if (result.upsertedCount > 0) {
            res.json({
              result: "success",
              message: `Ingredient '${name}' created successfully.`,
              data: await ingredientsCollection.findOne(filter),
            });
          } else {
            res.json({
              result: "fail",
              message: "No changes made.",
            });
          }
          } catch (err) {
            //   console.log(err);
              res.status(500).json({
                result: "fail",
                error: "Internal Server Error",
              });
        }
      })
      
      app.post("/chat", async (req, res) => {
        try {
          const { message } = req.body;

          const model = await genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
          });

          const filePath = "fav_recipe.txt";
          const recipes = parseRecipes(filePath);

          const ingredients = await ingredientsCollection.find().toArray();

          const prompt = `
            The user has asked: "${message}".

            Based on the user's request, please suggest a recipe that uses the available ingredients: ${JSON.stringify(
              ingredients
            )} and aligns with the following recipes:

            ${JSON.stringify(
              recipes
            )}. If you match 50% of any recipe send the recipe in the response. Give me the Partial or Matching result and give me a text of recipe.
        `;
            
            // console.log(prompt);

          const result = await model.generateContent(prompt);

          res.json({
            result: result.response.text(),
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({
            result: "fail",
            error: err.message || "Internal Server Error",
          });
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
  res.send("Prili server is running");
});

app.listen(port, () => {
  console.log("Prili server is run on port", port);
});
