/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const Joi = require('@hapi/joi');

exports.authValidation = Joi.object({

    password: Joi.string()
        .pattern(new RegExp('[a-zA-Z0-9]{3,10}$'))
        .required(),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io', 'org'] } })
        .required()
});