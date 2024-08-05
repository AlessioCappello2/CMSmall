import { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../API.js";


export function EditPage(props){
    const navigate = useNavigate();
    let { idPage } = useParams(); 

    const [inputFields, setInputFields] = useState([]);
    const [title, setTitle] = useState('');
    const [pubdate, setPubdate] = useState('');
    const [creationdate, setCreationdate] = useState('');
    const [author, setAuthor] = useState('');
    const [authors, setAuthors] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchPage = async () => {
          try{
            const page = await API.getPage(idPage);
            const au = await API.getAuthor(idPage);
            const titlepubdate = await API.getTitleDates(idPage);
            const fields = page.map((item) => ({ type: item.type, value: item.content }));
            const predispose = [...fields, {type: '', value: ''}]
            if (props.user.role === 1){
              const authors = await API.getAuthors();
              setAuthors(authors);
            }
            setInputFields(predispose);
            setTitle(titlepubdate.title);
            setPubdate(titlepubdate.publicationdate);
            setCreationdate(titlepubdate.creationdate);
            setAuthor(au.id)
        }
        catch(err){
          navigate('/error', {message: err});
        }
  }        
  fetchPage();
}, [idPage, navigate, props.user.role]);

    const handleAddFields = () => {
        const updatedFields = [...inputFields, { type: '', value: '' }];
        setInputFields(updatedFields);
    };
    
    const handleRemoveFields = (index) => {
        const updatedFields = [...inputFields];
        updatedFields.splice(index-1, 1);
        setInputFields(updatedFields);
    };

    const handleChange = (index, event) => {
      const { name, value } = event.target;
      const updatedFields = [...inputFields];
      updatedFields[index][name] = value 

      if (name === 'type' && value !== 'I') {
        updatedFields[index].value = '';
      }

      setInputFields(updatedFields);
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
          index = index - 1
          const updatedFields = [...inputFields];
          [updatedFields[index - 1], updatedFields[index]] = [updatedFields[index], updatedFields[index - 1]];
          setInputFields(updatedFields);
        }
      };
    
    const handleMoveDown = (index) => {
        if (index < inputFields.length - 1) {
          index = index - 1
          const updatedFields = [...inputFields];
          [updatedFields[index], updatedFields[index + 1]] = [updatedFields[index + 1], updatedFields[index]];
          setInputFields(updatedFields);
        }
    };

    const handleSubmit = async () => {
      try{
        if(submitting) return;
        setSubmitting(true);
        const fullBlocks = inputFields.map((b, i) => ({type: b.type, content: b.value, position: i+1})).slice(0, -1);
        const fullPage = {title: title, publicationdate: pubdate, creationdate: creationdate, idauthor: author, blocks: fullBlocks, id: idPage}
        await API.updatePage(fullPage);
        navigate('/back');
      }catch(err){
        setErrorMsg(err.errors[0]);
      }finally{
        setSubmitting(false);
      }

  }

    const renderFields = () => {
        return inputFields.map((field, index) => {return(
            <Row className="mt-1" key={index}>
              &nbsp;
                <Col sm={2}>
                <Form.Group controlId={`block${index}`}>
                    <Form.Label>Block Type</Form.Label>
                    <Form.Control className="form-select" as="select" name="type" value={field.type} placeholder="Type" style={{border: '1px solid'}} onChange={(event) => handleChange(index, event)}>
                <option value="" disabled style={{ display: 'none'}}>Select block type</option>
                <option value="H">Header</option>
                <option value="P">Paragraph</option>
                <option value="I">Image</option>
                    </Form.Control>
                </Form.Group>
                </Col>

                <Col sm={1}>
                </Col>

                <Col sm={6}>
                    {field.type === 'I' ? (
                        <Form.Group controlId={`option${index}`}>
                        <Form.Label>Image</Form.Label>
                        <Form.Control className="form-select" as="select" name="value" value={field.value} style={{border: '1px solid'}} placeholder="Select image"
                            onChange={(event) => handleChange(index, event)} >
                        <option value="" disabled style={{ display: 'none'}}>Select image</option>
                        <option value="LandscaXPe.jpg">Landsca(x)pe</option>
                        <option value="Torino.jpg">Turin</option>
                        <option value="Supercar.jpg">Supercar</option>
                        <option value="Unexpected.jpg">Something very unexpected</option>
                        <option value="Beerbongs&Bentleys.png">Beerbongs&Bentleys</option>
                        <option value="Currents.png">Currents</option>
                        <option value="Garpez.png">Garpez</option>
                        <option value="Goteborg.jpg">Goteborg</option>
                        <option value="Jacobs.jpg">Jacobs</option>
                        <option value="Lavori.png">Lavori</option>
                        <option value="Starboy.png">Starboy</option>
                        <option value="YodaDance.gif">YodaDance</option>
              </Form.Control>
            </Form.Group>
          ) : (
            <Form.Group controlId={`textInput${index}`}>
              <Form.Label>Text Input</Form.Label>
              <Form.Control type="text" name="value" value={field.value} style={{border: '1px solid'}} onChange={(event) => handleChange(index, event)}/>
            </Form.Group>
          )}
        </Col>
        <Col sm={2}>
          {index > 0 && (
            <Row>
            <Col sm={3}><Button style={{ marginTop: '-76px'}} variant="info" hidden={index===1} onClick={() => handleMoveUp(index)}>
            <i className="bi bi-arrow-up-circle"></i>
            </Button></Col>
            <Col sm={3}><Button style={{ marginTop: '-76px'}} variant="info" hidden={index===inputFields.length-1} onClick={() => handleMoveDown(index)}>
            <i className="bi bi-arrow-down-circle"></i>
            </Button></Col>
            <Col sm={3}><Button style={{ marginTop: '-76px'}} variant="danger" onClick={() => handleRemoveFields(index)}>
            <i className="bi bi-trash3"></i>
            </Button></Col>
            </Row>
          )}
        </Col>
        </Row>)
      })
    }

    return(
    <Container fluid>
      <h2>Edit page</h2>
      {errorMsg ? <div className='d-flex justify-content-center'><Alert className='col-4' variant='danger' dismissible onClick={()=>setErrorMsg('')}>{errorMsg}</Alert></div> : ''}
    <Form onSubmit={(ev) => ev.preventDefault()}>
    <Form.Group className="row mt-3" controlId="pageTitle">
      <Form.Label className="col-sm-1 mt-1 d-flex justify-content-end fw-bold">&nbsp;Title (*)</Form.Label>
        <div className="col-sm-3">
        <Form.Control type="text" name="title" value={title} style={{border: '1px solid'}} onChange={(ev) => setTitle(ev.target.value)}/>
        </div>
        {props.user.role ? <>
        <Form.Label className="col-sm-1 mt-1 d-flex justify-content-end">Author</Form.Label>
        <div className="col-sm-2">
        <Form.Control className="form-select" as="select" value={author} style={{border: '1px solid'}} onChange={(ev) => setAuthor(ev.target.value)}>
          {authors.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Form.Control>
        </div></> : <></>}
      <Form.Label className="col-sm-2 mt-1 d-flex justify-content-end">&nbsp;Publication Date</Form.Label>
      <div className="col-sm-2">
      <Form.Control type="date" name="pubdate" value={pubdate} style={{border: '1px solid'}} onChange={(ev) => setPubdate(ev.target.value)}/>
      </div>
    </Form.Group>
        
        <hr style={{ background: 'linear-gradient(to right, transparent, #000, transparent)', border: 'none', height: '1px' }} />
        
        {renderFields()}

        <Button style={{marginTop: '-39px'}} className="float-end" variant="primary" onClick={handleAddFields}>
        <i className="bi bi-plus-circle"></i>
        </Button>
        <Button style={{marginTop: '10px'}} className="float-end" variant="success" disabled={submitting} onClick={() => handleSubmit()}>
        <i className="bi bi-upload"></i> SUBMIT
        </Button>

    </Form>
    <Button style={{marginTop: '10px'}} className="float-start" variant="dark" onClick={() => navigate(-1)}>Go back</Button>
    </Container>
    );

}