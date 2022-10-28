import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import React, { useState } from 'react';
import ChartType from './ChartType';
import Refine from './Refine';
import Annotate from './Annotate';
import Layout from './Layout';

const Visualize = () => {
  const [key, setKey] = useState('home');
  return (
    <Container className="py-3">
      <Row>
        <Col>
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
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
        </Col>
      </Row>
    </Container>
  );
};
export default Visualize;
