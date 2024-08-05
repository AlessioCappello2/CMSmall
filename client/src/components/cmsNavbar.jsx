import { Navbar, Container, Button, Row, Col, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function CmsNavbar(props){
    
    const navigate = useNavigate();

    return (<>
      <Navbar style={{height: "60px"}} bg="primary" sticky="top" variant="dark">
          <Container fluid>
          <Row className='w-100'>
          <Col className='col-4'>
            <Nav className="me-auto"> &nbsp;&nbsp;&nbsp;                
              <Button bg="primary" mr={3} onClick={() => navigate("/")}><i className="bi bi-house-door-fill"></i> FrontOffice</Button> &nbsp;&nbsp;&nbsp;
              <Button bg="primary" mr={3} onClick={() => navigate("/back")}><i className="bi bi-journal"></i> BackOffice</Button> &nbsp;&nbsp;&nbsp;
              {props.user !== undefined && props.user.role ? <Button variant="primary" mr={3} onClick={() => navigate("/website")}><i className="bi bi-gear-fill"></i> Website</Button> : <></>}
            </Nav>
          </Col>
          <Col className='col-4 d-flex justify-content-center'>
            <Navbar.Brand>{props.title}</Navbar.Brand>
          </Col>
          <Col className='col-4 d-flex justify-content-end'>
              {props.user === undefined ? 
                <Button variant="outline-light" onClick={() => navigate("/login")}><i className="bi bi-key-fill"></i> Login</Button>
                  :
                <Navbar.Text className="fs-10">
                {props.user.role ? "Admin: " + props.user.name : 
                  "Signed in as: " + props.user.name }
                &nbsp;&nbsp;
                <Button variant="danger" className="btn-sm" onClick={() => {props.doLogOut(); navigate("/")}}><i className="bi bi-box-arrow-left"></i> Logout</Button>
                </Navbar.Text>
              }
          </Col>
          </Row>
          </Container>
        </Navbar>
    </>)
}