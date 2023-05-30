import {Container, Col, Row} from 'react-bootstrap';

export default function Progress() {
    return (
        <Container fluid name="footer-container">
            <Row>
                <Col md={{span: 6, offset: 3}}>
                    <span className="text-center text-secondary"> <i> A <a href="https://gulan28.com">Gulan</a> product </i></span>
                </Col>
            </Row>
        </Container>
    );
  }