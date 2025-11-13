import "./Contact.css";

function Contact() {
  return (
    <div className="contact-container">
      <h1>Nous contacter 📩</h1>
      <p className="contact-subtitle">
        Si vous avez des questions, suggestions ou simplement envie de discuter,
        n'hésitez pas à nous écrire !
      </p>

      <div className="contact-email-box">
        <p className="contact-prompt">Notre adresse email :</p>
        <a
          href="mailto:gdrivoncollin@gmail.com?subject=Contact depuis Ciné Délices"
          className="contact-mail"
        >
          gdrivoncollin@gmail.com
        </a>
      </div>

      <p className="contact-response-time">
        Nous nous engageons à vous répondre dans les <strong>24 à 48 heures</strong> ! 😊
      </p>
    </div>
  );
}

export default Contact;
