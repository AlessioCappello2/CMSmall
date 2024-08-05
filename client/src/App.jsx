import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CmsNavbar } from './components/cmsNavbar';
import { LoginForm } from './components/authComponents';
import { RouteNotFound } from './components/routeNotFound'
import { FrontOffice, BackOffice , PageDetail } from './components/pageLayout';
import { AddPage } from './components/addPage';
import { EditPage } from './components/editPage';
import { WebsiteName } from './components/websiteName';

import {API} from './API.js'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {

  const [user, setUser] = useState(undefined)
  const [page, setPage] = useState([]);
  const [author, setAuthor] = useState(undefined);
  const [title, setTitle] = useState('');
  const [pubdate, setPubdate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(()=> {
    const checkAuth = async() => {
      try{
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // it's ok, the user is not logged in
      }  
    };
    checkAuth();
  }, [loggedIn]);

  useEffect(() => {
    const loadTitle = async() => {
      try {
        const t = await API.getWebName();
        setTitle(t);
        document.title = t;
      } catch(err) {
        setErrorMsg(err);
      }
    };
    loadTitle();
  }, [title]);

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
  }

  const handleGetPage = async(pageId) => {
      try{  
        const pg = await API.getPage(pageId);
        const au = await API.getAuthor(pageId);
        const pbdate = await API.getTitleDates(pageId);
        setPage(pg);
        setAuthor(au.author);
        setPubdate(pbdate.publicationdate)
      } catch(err) {
        setErrorMsg(err);
      }
  }

  const changeTitle = async(newTitle) => {
    try {
      const t = await API.setWebName(newTitle);
      setTitle(t);
      document.title = t;
    } catch(err) {
      setErrorMsg(err.errors[0]);
    }
  }


  return <>
    <BrowserRouter>
      <CmsNavbar className='w-100' user={user} doLogOut={doLogOut} isLoggedIn={loggedIn} title={title} changeTitle={changeTitle}/>
        <Routes>
          <Route index element={<FrontOffice user={user} setPage={setPage} handleGetPage={handleGetPage}/>}></Route>
          <Route path='/login' element={loggedIn ? <Navigate replace to='/back' />:<LoginForm loginSuccessful={loginSuccessful} />} />
          <Route path='/page/:idPage' element={<PageDetail page={page} author={author} pubdate={pubdate}/>}></Route>
          <Route path='/back' element={loggedIn ? <BackOffice user={user} setPage={setPage} handleGetPage={handleGetPage}/> : <Navigate replace to='/login'/>}></Route>
          <Route path='/edit/:idPage' element={<EditPage user={user}></EditPage>}></Route>
          <Route path='/new' element={<AddPage user={user}/>}></Route>
          <Route path='/website' element={ <WebsiteName title={title} changeTitle={changeTitle} errorMsg={errorMsg} setErrorMsg={setErrorMsg}/>}></Route>
          <Route path='/error' element={<RouteNotFound msg={errorMsg}/>}></Route>
          <Route path='/*' element={<Navigate replace to='/error'/>}/>
        </Routes>
    </BrowserRouter>
  </>

}

export default App
