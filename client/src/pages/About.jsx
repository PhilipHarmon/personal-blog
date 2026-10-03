import React from "react";
import FollowButton from "../components/FollowButton.jsx";

export default function About() {
  return (
    <div className="narrow">
      <h1>About Philip</h1>
      <div className="about-body">
        <p>
          Hey y'all! I'm Philip Harmon. I'm a husband, a dad of three (Wyatt,
          Pepper, and Briar), and a FedEx dispatcher working out of the Raleigh
          area in North Carolina. I write this quirky, stream-of-consciousness
          style blog because I've always believed writing is how you find out
          what you think. And with all the shit I've seen and done during my 53
          trips around the sun, I have thoughts on just about everything. This
          is the place I get to share these thoughts.
        </p>
        <p>
          By day I keep four stations of drivers working their routes: I move
          and assign pickups,clear routes, track pickup status, and keep watch
          over my flock. Before Fedex, I was a software developer. And before
          that, I was a bartender and server for 25 years. I loved my job in
          software, so I continue to learn and work on new things. At Fedex, we
          use Microsoft products, so I'm currently learning Power BI, which is
          amazing! I also tinker with just about anything that catches my eye.
          I'm not afraid to pop the hood and see how things work, and I love to
          learn new skills.
        </p>
        <p>
          At home, life is Legos and ballet recitals, World War II history
          questions from a ten-year-old, Taylor Swift dance parties, and the
          occasional quiet moment with my wife Jessica. I'd like to think that I
          still have time to read, but that's not entirely true. I still listen
          to my music as often as I can, but it usually gets switched to Taylor
          Swift. In the car, it's Phish and only Phish.
        </p>
        <p>
          This quirky blog is where everything lands: thoughts on fatherhood,
          thoughts on books (King, Pynchon, Wallace — the doorstoppers),
          thoughts on music that keeps me up late, the occasional nostalgic
          waxing on growing up in the 80s and being a Gen Xer, observations from
          25 in the restaurant business,and the occasional story from the
          dispatch desk. I'm glad you're here and I hope you enjoy what you
          read.
        </p>
      </div>
      <FollowButton />
    </div>
  );
}
