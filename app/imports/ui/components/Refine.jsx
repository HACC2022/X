import React, { useState } from 'react';
import { Form, Col, Row } from 'react-bootstrap';

const Refine = () => {
  const [value, setValue] = useState(0);
  return (
    <Form>
      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label><strong>Horizontal axis</strong></Form.Label>
        <br />
        <Form.Label column sm="3">Select column</Form.Label>
        <Col sm="6">
          <Form.Select size="sm">
            <option>X.1</option>
          </Form.Select>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <br />
        <Form.Label column sm="3">Custom range</Form.Label>
        <Col sm="3"><Form.Control size="sm" type="text" placeholder="min" /></Col>
        to
        <Col sm="3"><Form.Control size="sm" type="text" placeholder="max" /></Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <br />
        <Form.Label column sm="3">Custom ticks</Form.Label>
        <Col sm="6"><Form.Control size="sm" type="text" placeholder="e.g. 2000,2005,2012" /></Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label column sm="3">Tick format</Form.Label>
        <Col sm="6">
          <Form.Select size="sm">
            <option>(automatic)</option>
            <option>1000[.00]</option>
            <option>0</option>
            <option>0.0</option>
            <option>0.00</option>
            <option>0.000</option>
            <option>0.[0]</option>
            <option>0.[00]</option>
            <option>0%</option>
            <option>0.0%</option>
            <option>0.00%</option>
            <option>0.[0]%</option>
            <option>0.[00]%</option>
            <option>10,000</option>
            <option>1st</option>
            <option>123k</option>
            <option>123.4k</option>
            <option>123.45k</option>
            <option>(custom)</option>
          </Form.Select>
        </Col>
      </Form.Group>

      {['radio'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Label column sm="3">Grid lines</Form.Label>
          <Form.Check
            inline
            label="show"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            inline
            label="hide"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
          <Form.Check
            inline
            label="tick marks"
            name="group3"
            type={type}
            id={`inline-${type}-3`}
          />
        </div>
      ))}
      <hr />
      <Form.Label column sm="3"><strong>Vertical axis</strong></Form.Label>
      {['radio'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Label column sm="3">Grid lines</Form.Label>
          <Form.Check
            inline
            label="linear"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            inline
            label="logarithmic"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
        </div>
      ))}

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <br />
        <Form.Label column sm="3">Custom range</Form.Label>
        <Col sm="3"><Form.Control size="sm" type="text" placeholder="min" /></Col>
        to
        <Col sm="3"><Form.Control size="sm" type="text" placeholder="max" /></Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <br />
        <Form.Label column sm="3">Custom ticks</Form.Label>
        <Col sm="6"><Form.Control size="sm" type="text" placeholder="e.g. 10,20,50" /></Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label column sm="3">Number format</Form.Label>
        <Col sm="6">
          <Form.Select size="sm">
            <option>(automatic)</option>
            <option>1000[.00]</option>
            <option>0</option>
            <option>0.0</option>
            <option>0.00</option>
            <option>0.000</option>
            <option>0.[0]</option>
            <option>0.[00]</option>
            <option>0%</option>
            <option>0.0%</option>
            <option>0.00%</option>
            <option>0.[0]%</option>
            <option>0.[00]%</option>
            <option>10,000</option>
            <option>1st</option>
            <option>123k</option>
            <option>123.4k</option>
            <option>123.45k</option>
            <option>(custom)</option>
          </Form.Select>
        </Col>
      </Form.Group>

      {['radio'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Label column sm="3">Grid lines</Form.Label>
          <Form.Check
            inline
            label="show"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            inline
            label="hide"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
          <Form.Check
            inline
            label="tick marks"
            name="group3"
            type={type}
            id={`inline-${type}-3`}
          />
        </div>
      ))}

      {['radio'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Label column sm="3">Grid labels</Form.Label>
          <Form.Check
            inline
            label="show"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            inline
            label="hide"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
          <Form.Check
            inline
            label="tick marks"
            name="group3"
            type={type}
            id={`inline-${type}-3`}
          />
          <Form.Check
            inline
            label="left"
            name="group4"
            type={type}
            id={`inline-${type}-4`}
          />
          <Form.Check
            inline
            label="right"
            name="group5"
            type={type}
            id={`inline-${type}-5`}
          />
        </div>
      ))}
      <hr />
      <Form.Label column sm="3"><strong>Customize lines</strong></Form.Label>
      <br />
      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label column sm="3" htmlFor="exampleColorInput">Base color</Form.Label>
        <Col sm="6"><Form.Control
          type="color"
          id="exampleColorInput"
          defaultValue="#563d7c"
          title="Choose your color"
        />
        </Col>
      </Form.Group>
      <Form.Group><Form.Label column sm="3">Line width</Form.Label></Form.Group>
      <Form.Group><Form.Label column sm="3">Line dashes</Form.Label></Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label column sm="3">Interpolation</Form.Label>
        <Col sm="6">
          <Form.Select size="sm">
            <option>linear</option>
            <option>curved</option>
            <option>curved(cardinal)</option>
            <option>curved(natural)</option>
            <option>steps(after)</option>
            <option>steps(before)</option>
            <option>steps</option>
          </Form.Select>
        </Col>
      </Form.Group>
      <hr />
      <Form.Label column sm="3"><strong>Labeling</strong></Form.Label>
      {['radio'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Label column sm="3">Line labels</Form.Label>
          <Form.Check
            inline
            label="top"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            inline
            label="right"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
          <Form.Check
            inline
            label="none"
            name="group3"
            type={type}
            id={`inline-${type}-3`}
          />
        </div>
      ))}
      {['checkbox'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Check
            label="Draw lines connecting labels to lines"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
          <Form.Check
            label="Use line color for labels"
            name="group2"
            type={type}
            id={`inline-${type}-2`}
          />
        </div>
      ))}
      <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
        <Form.Label column sm="3">Label margin</Form.Label>
        <Col sm="3">
          <Form.Range
            value={value}
            onChange={e => setValue(e.target.value)}
            min={0}
            max={600}
          />
        </Col>
        <Col sm="1">
          <Form.Control size="sm" value={value} type="text" onChange={e => setValue(e.target.value)} />
        </Col>
        <Col><Form.Text>px (0 = auto)</Form.Text></Col>
      </Form.Group>
      {['checkbox'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Check
            label="Show tooltips"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
        </div>
      ))}
      <hr />
      <Form.Label column sm="3"><strong>Customize symbols</strong></Form.Label>
      {['checkbox'].map((type) => (
        <div key={`inline-${type}`} className="mb-3">
          <Form.Check
            label="Line symbols"
            name="group1"
            type={type}
            id={`inline-${type}-1`}
          />
        </div>
      ))}
      <Form.Label column sm="3"><strong>Fill area between lines</strong></Form.Label>
      <hr />
    </Form>

  );
};
export default Refine;
