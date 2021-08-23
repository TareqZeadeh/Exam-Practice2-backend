'use strict';
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });


const drinkSchema = new mongoose.Schema({
    drinkName: String,
    drinkImg: String,
});

const userSchema = new mongoose.Schema({
    email: String,
    drinks: [drinkSchema],
})

const userModel = mongoose.model('userdrink', userSchema);


const allDrinksHandler = (req, res) => {

    axios
        .get(process.env.API_URL)
        .then(result => {
            const drinksArr = result.data.drinks.map(drink => {
                return new Drink(drink);
            })
            res.send(drinksArr)
        })
}


const userDrinksHandler = (req, res) => {
    const { email } = req.query;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else if(!result){
            res.send([]);
        }
        else {
            res.send(result.drinks);
        }
    });
}


const addDrinkHandler = (req, res) => {
    const { email, drinkObj } = req.body;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else if (!result) {
            const newUser = new userModel({
                email: email,
                drinks: [drinkObj],
            });
            newUser.save();
        }

        else {
            result.drinks.push(drinkObj);
            result.save();
        };

    });
}


const deleteDrinkHandler = (req, res) => {
    const { idx } = req.params;
    const { email } = req.query;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else {
            result.drinks.splice(idx, 1);
            result.save().then(() => {
                userModel.findOne({ email: email }, (err, result) => {
                    if (err) { console.log(err); }
                    else {
                        res.send(result.drinks);
                    }
                });

            });
        };
    });

}


const updateDrinkHandler =(req,res)=>{
    const { idx } = req.params;
    const { email, drinkObj } = req.body;
    userModel.findOne({ email: email }, (err, result) => {
        if (err) { console.log(err); }
        else {
            result.drinks[idx] = drinkObj ;
            result.save().then(() => {
                userModel.findOne({ email: email }, (err, result) => {
                    if (err) { console.log(err); }
                    else {
                        res.send(result.drinks);
                    }
                });

            });
        };
    });

}




class Drink {
    constructor(drink) {
        this.drinkName = drink.strDrink;
        this.drinkImg = drink.strDrinkThumb;
    }
}


//http://localhost:3002/allDrinks
server.get('/allDrinks', allDrinksHandler);

server.post('/addDrink', addDrinkHandler);

server.get('/userDrinks', userDrinksHandler);

server.delete('/deleteDrink/:idx', deleteDrinkHandler);

server.put('/updateDrink/:idx', updateDrinkHandler);








server.listen(PORT, () => {
    console.log('listening to ', PORT);
})