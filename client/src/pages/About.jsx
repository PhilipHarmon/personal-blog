import React from 'react';
import FollowButton from '../components/FollowButton.jsx';

export default function About() {
  return (
    <div className="narrow">
      <h1>About Philip</h1>
      <div className="about-body">
        <p>
          Hi — I'm Philip Culpepper. I'm a husband, a dad of three (Wyatt, Pepper, and Briar),
          and a FedEx dispatcher working out of the Raleigh area in North Carolina. I write
          this blog because I've always believed writing is how you find out what you think —
          I majored in English literature, and the habit of putting words down never left me.
        </p>
        <p>
          By day I keep four stations of drivers moving: clearing routes, tracking pickups,
          and signing off messages with my little dispatch tag. But I'm also working my way
          back into software — I spent a couple of years as a JavaScript developer, and now
          I'm studying my way toward data and Power BI work, one concept at a time. Expect
          posts about the learning curve, the wins, and the long nights.
        </p>
        <p>
          At home, life is Legos and ballet recitals, World War II history questions from a
          ten-year-old, Taylor Swift sing-alongs, and a Sunday dinner menu we plan together
          every week. This blog is where all of it lands: essays on fatherhood, book notes
          (King, Pynchon, Wallace — the doorstoppers), music that keeps me up late, and the
          occasional story from the dispatch desk. I'm glad you're here.
        </p>
      </div>
      <FollowButton />
    </div>
  );
}
