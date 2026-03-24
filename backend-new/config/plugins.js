module.exports = ({ env }) => ({
    email: {
        config: {
            provider: "@strapi/provider-email-nodemailer",  
            providerOptions: {
              host: "smtp.gmail.com",
  port: 587,
  secure: false,
                auth: {
                    user: env("EMAIL_USER"),
                    pass: env("EMAIL_PASS"),
                },
            },
            settings: {
                defaultFrom: env("EMAIL_USER"),
                defaultReplyTo: env("EMAIL_USER"),
            },
        },
    },
});