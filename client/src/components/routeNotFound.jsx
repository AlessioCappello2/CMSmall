import { Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"

function RouteNotFound(props) {
  const {state} = useLocation();
  const {message} = state || (props.msg ? props.msg : {message: 'No message!'});
  
    return(
      <Container className='App'>
        <h1>No data here...</h1>
        <h2>This is not the route you are looking for!</h2>
        <h3>{message}</h3>
        <Link to='/'>Please go back to main page</Link>
      </Container>
    );
}

export {RouteNotFound}