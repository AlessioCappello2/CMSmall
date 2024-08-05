import { useEffect, useState } from 'react';
import { Table, Row, Col, Button, Container } from 'react-bootstrap';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { API } from '../API.js';
import dayjs from 'dayjs';
import { ConfirmationModal } from './confirmationModal.jsx';

function PageRow(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const pageUrl = `/page/${props.page.id}`;

    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const content = async(id) => {
        try{
            await props.handleGetPage(id)
            navigate(pageUrl);
        }catch(err){
            console.log(err)
        }
    }

    const handleDelete = async(id) => {
        if(deleting) return;
        setDeleting(true);
        try{
            props.setIsLoading(true);
            await API.deletePage(id);
            setShowModal(false);
            props.setIsLoading(false);
        }catch(err){
            console.log(err)
        }
        setDeleting(false);
    }

    return (
        <tr>
          {showModal && <ConfirmationModal show={showModal} setShowModal={setShowModal} title={"WARNING!"} text={"Are you sure you want to delete " + props.page.title + "?"} handleConfirm={() => handleDelete(props.page.id)}/>}
            <td onClick={() => content(props.page.id)} style={{textDecoration: 'underline', cursor: 'pointer', color: '#0D6EFD'}}>{props.title}</td>
            <td>{props.author}</td>
            <td>{props.creationdate}</td>
            <td>{props.pubdate}</td>
            {location.pathname === '/' ? <></>: 
            <td><Button variant="warning" className="btn-sm me-2" disabled={!(props.user.role || props.user.id === props.pageauthorid) } onClick={() => navigate(`/edit/${props.page.id}`)}>EDIT</Button>
            <Button variant="danger" className="btn-sm" disabled={deleting || !(props.user.role || props.user.id === props.pageauthorid)} onClick={() => setShowModal(true)}>DELETE</Button></td>}
            </tr>
    )
}

export function FrontOffice(props){
    const navigate = useNavigate();
    const [pages, setPages] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // manage the pages
    useEffect(() => {
        const loadPages = async () => {
            try {
              const pages = await API.listPages()
              setPages(pages);
              setIsLoading(false);
            } catch (err) {
                navigate('/error', {message: err})
            }
          };
          loadPages();
        }, [isLoading])

    return (
        <Container fluid>
          <h2 style={{marginTop: '5px'}}>Published pages</h2>
          &nbsp;
            <Table striped bordered hover size="sm" style={{ border: '1px solid #000', borderRadius: '5px'}}>
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="col-2" style={{backgroundColor: '#fc0'}}>Page</th>
                  <th scope="col" className="col-2" style={{backgroundColor: '#fc0'}}>Author</th>
                  <th scope="col" className="col-2" style={{backgroundColor: '#fc0'}}>Creation Date</th>
                  <th scope="col" className="col-2" style={{backgroundColor: '#fc0'}}>Publication Date</th>
                </tr>
              </thead>
              <tbody>
              {pages.map((page) => <PageRow handleGetPage={props.handleGetPage} setPage={props.setPage} key={page.id} page={page} title={page.title} pubdate={page.publicationdate} creationdate={page.creationdate} author={page.author}/>)}
              </tbody>
        </Table>
        </Container>
    )   
}

export function BackOffice(props){
    const navigate = useNavigate();
    const [pages, setPages] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadPages = async () => {
            try {
              const pages = await API.authPages()
              setPages(pages);
              setIsLoading(false);
            } catch (err) {
              navigate('/error', {message: err})
            }
          };
        loadPages();
    }, [isLoading])

    return (
        <Container fluid>
          <h2 style={{marginTop: '5px'}}>All pages</h2>
          &nbsp;
            <Table striped bordered hover size="sm" style={{ border: '1px solid #000', borderRadius: '5px'}}>
              <thead className="thead-dark">
                <tr>
                  <th scope="col" style={{backgroundColor: '#fc0'}}>Page</th>
                  <th scope="col" style={{backgroundColor: '#fc0'}}>Author</th>
                  <th scope="col" style={{backgroundColor: '#fc0'}}>Creation Date</th>
                  <th scope="col" style={{backgroundColor: '#fc0'}}>Publication Date</th>
                  <th scope="col" style={{backgroundColor: '#fc0'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
              {pages.map((page) => <PageRow handleGetPage={props.handleGetPage} setPage={props.setPage} key={page.id} page={page} title={page.title} pubdate={page.publicationdate} creationdate={page.creationdate} author={page.author} user={props.user} pageauthorid={page.idauthor} setIsLoading={setIsLoading}/>)}
              </tbody>
        </Table>        
        <Button variant="primary" className="float-end" onClick={() => navigate('/new')}><i className="bi bi-pencil-fill"></i> New Page</Button>
        </Container>
    )   
}

function BlockRow(props) {
    switch(props.block.type){
        case 'P':
            return <p key={props.block.id}>{props.block.content}</p>
        case 'H':
            return <h3 key={props.block.id}>{props.block.content}</h3>
        case 'I':
            return (<><img width={"450px"} key={props.block.id} src={`http://localhost:3000/server/images/${props.block.content}`} alt={`${props.block.content}`} /> <br/> </>)
        default:
            return <p key={props.block.id}>{props.block.content}</p>
    }
}


export function PageDetail(props){
  const navigate = useNavigate();
   return (<div style={{marginLeft: "10px"}}>
        <Button variant="dark" className="float-end" style={{ marginTop: '10px', marginRight: '10px' }} onClick={() => navigate(-1)}>Go back</Button>
        <h2>{props.page[0].title}</h2>
        <h4>Published by {props.author} {props.pubdate ? 'on ' + props.pubdate : '(Draft)'} {dayjs(props.pubdate).isAfter(dayjs()) ? '(Programmed)' : ''}</h4>
        <hr style={{marginLeft: "-10px", height: "1px", background: "linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))"}}></hr>
        <div>
        {props.page.map((block) => <BlockRow key={block.id} block={block}/>)}
        </div>
    </div>)
}