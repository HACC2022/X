import React from 'react';
import { Figure, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ChartType = () => (
  <Figure>
    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Bar Chart"
        src="https://static.thenounproject.com/png/2402371-200.png"
      />
      <br />
      <Link to="/verticalbarchart">Bar Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Stacked Bars"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAABlBMVEX///8AAABVwtN+AAABEklEQVR4nO3PMRKDMAxFweT+l05PIRsGwXe8r/VY0n4+kiRJkiRpmb6HRu9nAwEBAQEBuXIgyNVAJuf2XF0sBBnM7bm6WAgymNtzdbEQZDC35+piIchgbs/VxUKQwdyeq4uFIIO5PVcXC89CZgMBAQEB2RuyTCBpgaQFkhZIWiBpgaQFktY2kOP704GANAUC0hTIU5DZu0BAQEBAQEBAQEBAQN4KBKQpEJCmQKY/pgWSFkhaIGmBpAWSFkhaIGltAzm+3x0ICAgICMiVA0FAQEBAQEBAQEBAQLogd4FBQEBAQNaGLBNIWiBpgaQFkhZIWiBpgaT1t5C0QNICSQskLZC0QNICSQskrf0gkiRJkiTp9X6iGDEBV3EOWgAAAABJRU5ErkJggg=="
      />
      <br />
      <Link to="/stackedbarchart">Stacked Bars</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Grouped Bars"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/groupedbarchart">Grouped Bars</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Split Bars"
        src="holder.js/171x180"
      />
      <br />
      Split Bars
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Bullet Bars"
        src="holder.js/171x180"
      />
      <br />
      Bullet Bars
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Column Chart"
        src="holder.js/171x180"
      />
      <br />
      Column Chart
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Stacked Column Chart"
        src="holder.js/171x180"
      />
      <br />
      Stacked Column Chart
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="Grouped Coolumn Chart"
        src="holder.js/171x180"
      />
      <br />
      Grouped Coolumn Chart
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/linechart">Line Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/areachart">Area Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/scatterchart">Scatter Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Table
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Dot Plot
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Range Plot
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Arrow Plot
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/piechart">Pie Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      <Link to="/doughnutchart">Doughnut Chart</Link>
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Multiple Pies
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Multiple Donuts
    </Button>

    <Button variant="outline-dark">
      <Figure.Image
        width={50}
        height={50}
        alt="171x180"
        src="holder.js/171x180"
      />
      <br />
      Election Donut
    </Button>
    <hr />
  </Figure>
);
export default ChartType;
