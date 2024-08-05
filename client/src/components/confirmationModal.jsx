import { Modal, Button } from "react-bootstrap"

export function ConfirmationModal(props) {

const handleConfirm = ()=>{
    props.handleConfirm();
    props.setShowModal(false)
}

    return (
        <Modal show={props.show} onHide={() => props.setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
  
          <Modal.Body>
            <p>{props.text}</p>
          </Modal.Body>
  
          <Modal.Footer>
            <Button variant="secondary" onClick={() => props.setShowModal(false)}>Close</Button>
            <Button variant="danger" onClick={() => handleConfirm()}>Confirm</Button>
          </Modal.Footer>
        </Modal>
    );
  }
  