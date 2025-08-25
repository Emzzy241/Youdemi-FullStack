import Joi from "joi";

export const signUpSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ["com", "net"] }
        }),
    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
})

export const signInSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ["com", "net"] }
        }),
    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
})

export const acceptCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ["com", "net"] }
        }),
    providedCode: Joi.number().required()
})

export const changePasswordSchema = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),

    oldPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
})

export const forgotPasswordCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ["com", "net"] }
        }),
    providedCode: Joi.number().required()
})

export const acceptForgotPasswordCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ["com", "net"] }
        }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$'))
})

export const CreateCourseSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(60)
        .required(),
    description: Joi.string()
        .min(6)
        .max(60)
        .required(),
    userId: Joi.string().required()
})