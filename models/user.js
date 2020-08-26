const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String },
    password: { type: String },
    password1: { type: String },
    email: { type: String },
});

const Users = mongoose.model("people", userSchema);

function validateUser(user) {
    const schema = {
        name: Joi.string().required(),
        email: Joi.string().email().required().lowercase(),
        username: Joi.string().required(),
        password: Joi.string().required(),
        confirmedpassword: Joi.string()
            .required()
            .valid(Joi.ref('password'))
            .options({
                language: {
                    any: {
                        allowOnly: '!!Passwords do not match',
                    }
                }
            })
    };

    return Joi.validate(user, schema);
}

function validateCurrentuser(users) {
    const schemas = {
        email: Joi.string().email().required().lowercase(),
        password: Joi.string().required()
    };
    return Joi.validate(users, schemas);
}

module.exports.Users = Users;
module.exports.validateUser = validateUser;
module.exports.validateCurrentuser = validateCurrentuser;