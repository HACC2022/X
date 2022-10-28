import { Button, Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { ArrowLeft, ArrowRight } from 'react-bootstrap-icons';
import React from 'react';
import ChartType from './ChartType';
import Refine from './Refine';
import Annotate from './Annotate';
import Layout from './Layout';

const Visualize = () => (
  <Container className="py-3">
    <Row>
      <Col>
        <Tabs
          defaultActiveKey="profile"
          id="fill-tab-example"
          className="mb-3"
          fill
        >
          <Tab eventKey="home" title="Chart type">
            <ChartType />
          </Tab>
          <Tab eventKey="profile" title="Refine">
            <Refine />
          </Tab>
          <Tab eventKey="contact" title="Annotate">
            <Annotate />
          </Tab>
          <Tab eventKey="longer-tab" title="Layout">
            <Layout />
          </Tab>
        </Tabs>
        <Button variant="light"><ArrowLeft />Back</Button>
        <Button variant="primary">Proceed<ArrowRight /></Button>
      </Col>
    </Row>
  </Container>
);
export default Visualize;
