import React from 'react';
import { Figure, Button } from 'react-bootstrap';

const Publish = () => (
  <Figure>
    <h1>Publish visualization</h1>
    <Button variant="outline-success">
      <Figure.Caption>Your visualization is not published.</Figure.Caption>
      <Figure.Image
        width={171}
        height={180}
        alt="171x180"
        src="./images/chart/uploading.png"
      />
      <br />
      Publish now
    </Button>
    {/* eslint-disable-next-line react/no-unescaped-entities */}
    <p>You'll need to publish this visualization before embedding it on your website or sharing it on social media.
      <br />
      <br />
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      Your published visualization will still only be visible to people who know its URL. We won't share it publicly.
    </p>
    <br />
    <h1>Export or duplicate visualization</h1>
    <p>You can duplicate it to start editing a copy of the visualization. Or export it into other formats.</p>

    <Button variant="outline-success">
      <Figure.Image
        width={171}
        height={180}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      PNG
    </Button>

    <Button variant="outline-success">
      <Figure.Image
        width={171}
        height={180}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      DUPLICATE
    </Button>
  </Figure>
);
export default Publish;
