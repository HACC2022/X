import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';

const Annotate = () => (
  <Form>
    <Form.Group as={Col} controlId="formGridEmail">
      <Form.Label>Title</Form.Label>
      <Form.Control type="text" placeholder="Insert title here" />
    </Form.Group>

    <Form.Group controlId="formGridPassword">
      <Form.Label>Description</Form.Label>
      <Form.Control as="textarea" rows={3} />
    </Form.Group>

    <Form.Group className="mb-3" controlId="formGridAddress1">
      <Form.Label>Notes</Form.Label>
      <Form.Control placeholder="Your notes here :)" />
    </Form.Group>

    <Row className="mb-3">
      <Form.Group as={Col} className="mb-3" controlId="formGridAddress2">
        <Form.Label>Data source</Form.Label>
        <Form.Control placeholder="Who published the data?" />
      </Form.Group>

      <Form.Group as={Col} controlId="formGridCity">
        <Form.Label>Link to data source</Form.Label>
        <Form.Control placeholder="https://..." />
      </Form.Group>
    </Row>
    <Form.Group controlId="formGridState">
      <Form.Label>Byline</Form.Label>
      <Form.Control placeholder="Who created the chart?" />
      Alternative description for screen readers
    </Form.Group>

    <Form.Group controlId="formGridZip">
      <Form.Control as="textarea" rows={3} />
    </Form.Group>

    <Form.Label><strong>Text annotations</strong></Form.Label>
    <br />
    <Button variant="secondary" size="sm"><Plus />Add text annotation</Button>{' '}
    <br />
    <Form.Label><strong>Highlight range</strong></Form.Label>
    <br />
    <Button variant="secondary" size="sm"><Plus />Add range highlight</Button>{' '}
    <hr />
  </Form>
);
export default Annotate;
