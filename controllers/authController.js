const userModel = require('../models/user-model');
const retailerModel = require('../models/retailer-model');
const manufacturerModel = require('../models/manufacturer-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports.registerUser = async (req, res) => {
    try {
        const {place, phone, password, name} = req.body;

        let user = await userModel.findOne({ phone });
        if (user) return res.status(401).send("You already have an account");

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return res.send(err.message);

            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);

                try {
                    let user = await userModel.create({place, phone, password: hash, name});
                    const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_KEY, { expiresIn: '1w' });
                    res.cookie("token", token);
                    console.log(phone);
                    // res.send("User created");
                    return res.json({ token, id: user._id, role:user.role }); 
                } catch (error) {
                    res.send(error.message);
                }
            });
        });
    } catch (err) {
        res.send(err.message);
    }
};


module.exports.loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        let user = await userModel.findOne({ phone });

        if (!user) {
            console.error('User not found with phone:', phone);
            return res.status(400).json({ message: 'Phone Number or password incorrect' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (result) {
                const token = jwt.sign({ id: user._id,role: user.role }, process.env.JWT_KEY, { expiresIn: '1w' });
                res.cookie('token', token, { httpOnly: true });
                return res.json({ token, id: user._id,role:user.role }); // Include user ID in the response
                // For react, handle redirect on the client side after successful login
            } else {
                return res.status(400).json({ message: 'Password incorrect' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.registerRetailer = async (req, res) => {
    try {
        const { place,phone, password, name} = req.body;

        let user = await retailerModel.findOne({ phone });
        if (user) return res.status(401).send("You already have an account");

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return res.send(err.message);

            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);

                try {
                    let user = await retailerModel.create({ place,phone, password: hash, name});
                    const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_KEY, { expiresIn: '1w' });
                    res.cookie("token", token);
                    // res.send("Retailer created");
                    return res.json({ token, id: user._id, role:user.role }); 
                } catch (error) {
                    res.send(error.message);
                }
            });
        });
    } catch (err) {
        res.send(err.message);
    }
};

module.exports.loginRetailer = async (req, res) => {
    const { phone, password } = req.body;

    try {
        let retailer = await retailerModel.findOne({ phone });
        console.log(phone);
        if (!retailer) {
            return res.status(400).json({ message: 'Phone Number or password incorrect' });
        }

        bcrypt.compare(password, retailer.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ id: retailer._id, role:retailer.role }, process.env.JWT_KEY, { expiresIn: '1w' });
                res.cookie('token', token, { httpOnly: true });
                return res.json({ token, id: retailer._id, role:retailer.role }); 
                 // Redirect to retailer dashboard after successful login
            } else {
                res.status(400).json({ message: 'Password incorrect' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.registerManufacturer = async (req, res) => {
    try {
        const { username, password, email,balance} = req.body;

        let user = await manufacturerModel.findOne({ email });
        if (user) return res.status(401).send("You already have an account");

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return res.send(err.message);

            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);

                try {
                    let user = await manufacturerModel.create({ email, password: hash, username,balance});
                    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1w' });
                    res.cookie("token", token);
                    res.send("Manufacturer created");
                } catch (error) {
                    res.send(error.message);
                }
            });
        });
    } catch (err) {
        res.send(err.message);
    }
};

module.exports.loginManufacturer = async (req, res) => {
    const { phone, password } = req.body;

    try {
        let manufacturer = await manufacturerModel.findOne({ phone });

        if (!manufacturer) {
            return res.status(400).json({ message: 'Phone Number or password incorrect' });
        }

        bcrypt.compare(password, manufacturer.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ id: manufacturer._id,role:manufacturer.role }, process.env.JWT_KEY, { expiresIn: '1w' });
                res.cookie('token', token, { httpOnly: true });
                return res.json({ token, id: manufacturer._id,role:manufacturer.role });
            } else {
                res.status(400).json({ message: 'Password incorrect' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


