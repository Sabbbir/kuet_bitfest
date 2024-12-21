# kuet_bitfest
Repo for Team VAGABONDS: THE LAST DANCE

## API Documentation
-- Create Recipe
    api: http://localhost:5000/recipe
    req body: Retrieve the text file and push it into database so do not give any payload
 
-- Get All Recipe
    api: http://localhost:5000/recipe
    response: {
        "data": [
            {
            "_id": "6766c13ee02e9df2234d61b1",
            "name": "Pancakes",
            "ingredients": [
                {
                "name": "flour",
                "quantity": "200g"
                },
                {
                "name": "milk",
                "quantity": "300ml"
                },
                {
                "name": "egg",
                "quantity": "2pcs"
                },
                {
                "name": "sugar",
                "quantity": "50g"
                }
            ],
            "steps": "Mix all ingredients in a bowl. Heat a pan. Cook the batter for 2 minutes on each side.",
            "taste": "Sweet",
            "cuisineType": "American",
            "prepTime": "20 minutes",
            "reviews": 4.5
            },
            {
            "_id": "6766c13ee02e9df2234d61b2",
            "name": "Spaghetti Bolognese",
            "ingredients": [
                {
                "name": "spaghetti",
                "quantity": "200g"
                },
                {
                "name": "ground beef",
                "quantity": "300g"
                },
                {
                "name": "tomato sauce",
                "quantity": "200ml"
                },
                {
                "name": "garlic",
                "quantity": "2 cloves"
                }
            ],
            "steps": "Cook spaghetti. Prepare sauce with ground beef and tomato sauce. Combine and serve.",
            "taste": "Savory",
            "cuisineType": "Italian",
            "prepTime": "30 minutes",
            "reviews": 4.7
            }
        ]
    }

-- Create Ingredients
    api: http://localhost:5000/ingredients
    req body: {
        "name":"spaghetti",
        "quantity":"150g"
    }

-- Get all Ingredients
    api : http://localhost:5000/ingredients
    response: {
        "data": [
            {
            "_id": "6766c982cf8866fd5248b1bc",
            "name": "sugar",
            "quantity": "30g",
            "createdAt": "2024-12-21T13:58:26.764Z",
            "updatedAt": "2024-12-21T14:26:21.500Z"
            },
            {
            "_id": "6766c994cf8866fd5248b1bd",
            "name": "flour",
            "quantity": "20g",
            "createdAt": "2024-12-21T13:58:44.574Z",
            "updatedAt": "2024-12-21T13:58:44.574Z"
            },
            {
            "_id": "6766c9b5cf8866fd5248b1be",
            "name": "spaghetti",
            "quantity": "150g",
            "createdAt": "2024-12-21T13:59:17.562Z",
            "updatedAt": "2024-12-21T13:59:17.562Z"
            }
        ]
    }

-- Update Ingredients
    api: http://localhost:5000/ingredients/6766c982cf8866fd5248b1bc
    req body: {
        "quantity":"30g"
    }
    response: {
        "result": "success",
        "message": "Ingredient 'undefined' updated successfully.",
        "data": {
            "_id": "6766c982cf8866fd5248b1bc",
            "name": "sugar",
            "quantity": "34g",
            "createdAt": "2024-12-21T13:58:26.764Z",
            "updatedAt": "2024-12-21T15:55:48.421Z"
        }
    }

-- Suggest Recipe: 
    api: http://localhost:5000/chat
    req body: {
        "message":"I want American recipe"
    }
    response: "The available ingredients only partially match the \"Pancakes\" recipe.  You have 34g of sugar (out of 50g needed) and 20g of flour (out of 200g needed).  This is less than 50% of the required flour, so a full pancake recipe isn't feasible.\n\nHowever, we can adapt the recipe using the available ingredients to make a very small portion of something similar to pancakes. It won't be exactly like the original recipe.\n\n**Miniature Sweet Flatbreads (Adaption)**\n\nThis recipe uses the available sugar and flour and improvises to create a small sweet treat.  It won't be fluffy like pancakes due to the lack of milk and eggs.\n\n\n**Ingredients:**\n\n* 20g flour\n* 34g sugar\n\n**Instructions:**\n\n1. **Combine:** Mix the flour and sugar in a small bowl.\n2. **Add Liquid:**  Gradually add a small amount (approximately 2-3 tablespoons) of water, mixing until a very thick, sticky paste forms.  The consistency should be similar to very thick cookie dough.\n3. **Cook:** Heat a lightly oiled, non-stick pan over medium heat. \n4. **Form and Fry:** Drop small spoonfuls of the mixture onto the hot pan.  Flatten them slightly with a spatula.\n5. **Cook until golden brown:** Cook for 1-2 minutes per side, or until lightly browned and cooked through.\n\n**Note:** These will be small, dense, and sweet.  They are not a true pancake substitute due to the limited ingredients, but they make use of what's available.  You could add a pinch of cinnamon or other spices for extra flavor.\n"