import React from "react";
import emailjs from '@emailjs/browser';

import rice1 from "../assest/rice1.png";
import rice2 from "../assest/rice2.png";

import "./style.css";

export function Contact() {
  const form = React.useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.sendForm('service_vf1xct2', 'template_tiyf55g', form.current, 'RvlX4cKLWdp1UQopG')
      .then((result) => {
          console.log(result.text);
          // e.target.user_email.value = "";
          form.current.value = "";
      }, (error) => {
          console.log(error.text);
      });
  };

  return (
    <section className="testimonial-wrapper">
      <h1 className="testimonial-title">Testimonial</h1>
      <h2 className="feedback-title">Feedback</h2>

      <div className="feedback-container">
        <div className="feedback-card">
          <div className="feedback-image" ><img src={rice1} width={"250px"} height={"120px"} alt="pic"/></div>
          <p>As usual better price and product quality is good</p>
        </div>
        <div className="feedback-card">
          <div className="feedback-image"><img src={rice2} width={"250px"} height={"120px"} alt="pic"/></div>
          <p>Too good aroma and tast love it ,</p>
        </div>
      </div>

      <div className="contact-container">
        <h2>Contact Us</h2>
        <form ref={form} onSubmit={sendEmail}>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <textarea rows="4" placeholder="Message"></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </section>
  );
}
