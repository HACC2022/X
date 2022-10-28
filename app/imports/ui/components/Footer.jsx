import React from 'react';
import { Col, Container } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => (
  <footer className="mt-auto py-3 bg-light">
    <Container>
      <Col className="text-center">
        Datawrapper is developed by <strong>Datawrapper GmbH</strong>
        {' '}
        <br />
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a href="">We are Hiring</a>
        <br />
        Honolulu, HI 96822
        {' '}
        <br />
      </Col>
    </Container>
  </footer>
);

export default Footer;
