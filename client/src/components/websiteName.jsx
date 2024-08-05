'use strict';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from './confirmationModal';

export function WebsiteName(props){
  const navigate = useNavigate();
  const [web, setWeb] = useState(props.title);
  const [showModal, setShowModal] = useState(false);

    return(
        <Container className="justify-content-center">
        {props.errorMsg ? <div className='d-flex justify-content-center'><Alert className='col-4' variant='danger' dismissible onClick={()=>props.setErrorMsg('')}>{props.errorMsg}</Alert></div> : ''}
        <h2 style={{marginTop: "10px"}}>Change website name</h2>
        {showModal && 
        <ConfirmationModal show = {showModal} setShowModal={setShowModal} 
        handleConfirm={() => props.changeTitle(web)}
        text={"Do you want to set title " + web + "?"} title ={"Change title"}/>}
        <Form onSubmit={(e) => {e.preventDefault(); setShowModal(true)}}>
        <Form.Group className="row mt-4" controlId="myInput">
          <Form.Label className="col-sm-2">Website name (*)</Form.Label>
          <div className="col-sm-4">
            <Form.Control type="text" value={web} style={{border: '1px solid'}} onChange={(ev) => setWeb(ev.target.value)}/>
        </div>
        </Form.Group>
        <Button className="justify-content-center mt-2" variant="success" type="submit" /*{onClick={() => setShowModal(true)}}*/>
          SUBMIT
        </Button>
        <Button variant="dark" className="float-end" onClick={() => navigate(-1)}>Go back</Button>
      </Form>
      </Container>
    )
}