import "./Contact.css";

function Contact() {
  return (
    <div className="contact-container">
      <h1>Nous contacter 📩</h1>
      <p>Si vous avez des questions ou suggestions, n'hésitez pas à nous contacter.</p>

      {/* ✅ Lien "mailto" pour envoyer un e-mail */}
      <p>
        📧 Vous pouvez nous écrire à :  
        <a href="mailto:gdrivoncollin@gmail.com" className="contact-mail">
          gdrivoncollin@gmail.com
        </a>
      </p>

      <p>Nous vous répondrons dans les plus brefs délais ! 😊</p>
    </div>
  );
}

export default Contact;
