const nodemailer = require("nodemailer");

const sendMail = function (to, url, text, subject) {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to,
    subject,
    html: `<div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Bienvenue a Luxe Phone.</h2>
    <p>Toutes nos félicitations! Vous êtes presque prêt à commencer à utiliser Luxe Phone.
    Cliquez simplement sur le bouton ci-dessous pour ${text}.
    </p>
    
    <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>

    <p>Si le bouton ne fonctionne pas pour une raison quelconque, vous pouvez également cliquer sur le lien ci-dessous :
    </p>

    <div>${url}</div>
    </div>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) console.log(error);
    else return info;
  });
};

module.exports = {
  sendMail,
};
