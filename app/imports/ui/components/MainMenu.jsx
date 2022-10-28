import React from 'react';
import { Nav, Col, Row, Tab } from 'react-bootstrap';
import Visualize from './Visualize';
import Publish from './Publish';

const MainMenu = () => (
  <Tab.Container id="left-tabs-example" defaultActiveKey="first">
    <Row>
      <Col sm={3}>
        <Nav variant="pills" className="flex-column">
          <Nav.Item>
            <Nav.Link eventKey="first"><strong>1 </strong>Visualize</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="second"><strong>2 </strong>Publish & Embed</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col sm={9}>
        <Tab.Content>
          <Tab.Pane eventKey="first">
            <Visualize />
          </Tab.Pane>
          <Tab.Pane eventKey="second">
            <Publish />
          </Tab.Pane>
        </Tab.Content>
      </Col>
    </Row>
  </Tab.Container>
);
export default MainMenu;
