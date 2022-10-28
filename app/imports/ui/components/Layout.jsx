import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft, ArrowRight } from 'react-bootstrap-icons';

const Layout = () => (
  <Form>
    <Form.Group>
      <Form.Label><strong>Output locale</strong></Form.Label>
      <br />
      <Form.Label>Defines decimal and thousand separators as well as translation of month and weekday names.</Form.Label>
      <Col sm="5">
        <Form.Select size="sm">
          <option>English(en-US)</option>
          <option>MA de zenm me zhe me duo</option>
          <option>zhe yao bian dao shen me shi hou</option>
          <option>Sha bi ba</option>
          <option>Wei shen me yao xuan yu yan?</option>
          <option>hui bu hui na me duo yu yan ni mei B shu?</option>
        </Form.Select>
      </Col>
    </Form.Group>
    <br />
    <Form.Group as={Row}>
      <Form.Label><strong>Layout</strong></Form.Label>
      <br />
      <Form.Label column sm="3">Theme</Form.Label>
      <Col sm="5">
        <Form.Select size="sm">
          <option>Datawrapper</option>
          <option>Datawrapper(2012)</option>
          <option>Datawrapper(extended charset)</option>
          <option>Datawrapper(high contrast)</option>
          <option>Pageflow</option>
        </Form.Select>
      </Col>
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Show logo"
      />
      <Form.Check
        type="switch"
        label="Automatic dark mode"
        id="disabled-custom-switch"
      />
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Use the same colors in dark mode"
      />
    </Form.Group>
    <br />
    <Form.Group>
      <Form.Label><strong>Footer</strong></Form.Label>
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Data download"
      />
      <Form.Check
        type="switch"
        label="Image download options"
        id="disabled-custom-switch"
      />
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Embed link"
      />
      <Form.Check
        disabled
        type="switch"
        id="custom-switch"
        label="Datawrapper attribution"
      />
    </Form.Group>
    <br />
    <Form.Group>
      <Form.Label><strong>Share buttons</strong></Form.Label>
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Social media share buttons"
      />
    </Form.Group>
    <hr />
    <Button variant="outline-dark"><ArrowLeft />back</Button>
    <Button variant="outline-primary">Proceed<ArrowRight /></Button>
  </Form>
);
export default Layout;
