const APIURL = 'http://localhost:3000/api';

import dayjs from 'dayjs';

async function listPages() {
    const response = await fetch(APIURL+'/pages')
    const pages = await response.json();
    if (response.ok) {
        const result = pages.map((p) => ({ id: p.id, title: p.title, creationdate: p.creationdate === "" ? "" : dayjs(p.creationdate).format('YYYY-MM-DD'),
        publicationdate: p.publicationdate === null ? "" : dayjs(p.publicationdate).format('YYYY-MM-DD'), author: p.author, idauthor: p.idauthor})); 
        return result; 
    } else{
      throw pages; 
    }
}

async function authPages() {
  const response = await fetch(APIURL+'/pages/back', {credentials: 'include'})
  const pages = await response.json();
  if (response.ok) {
      const result = pages.map((p) => ({ id: p.id, title: p.title, creationdate: p.creationdate === "" ? "" : dayjs(p.creationdate).format('YYYY-MM-DD'),
      publicationdate: p.publicationdate === null ? "" : dayjs(p.publicationdate).format('YYYY-MM-DD'), author: p.author, idauthor: p.idauthor})); 
      return result; 
  } else{
    throw pages; 
  }
}

async function getPage(id) {
    const response = await fetch(APIURL+'/page/'+id);
    const blocks = await response.json();
    if (response.ok) {
      const result = blocks.map((b) => ({ id: b.id, type: b.type, content: b.content, position: b.position, title: b.title})); 
      return result;
    } else{
      throw blocks; 
    }
}

async function addPage(page){
    const response = await fetch(APIURL+'/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page})
    });
    const id = await response.json();
    if(response.ok){
        return id;
    } else {
        throw id;
    }
}

async function updatePage(page){
    const response = await fetch(APIURL+'/page/'+page.id, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page})
    });
    const id = await response.json();
    if(response.ok){
        return id;
    } else {
        throw id;
    }
}


async function deletePage(id){
    const response = await fetch(APIURL+'/page/'+id, {
        method: 'DELETE',
        credentials: 'include'
    });
    const page = await response.json();
    if(response.ok){
        return page;
    } else {
        throw page;
    }
}


async function getTitleDates(id){
  const response = await fetch(APIURL+'/info/'+id);
  const info = await response.json();
  if(response.ok){
      return info;
  }
  else{
      throw info;
  }
}

async function getAuthors(){
    const response = await fetch(APIURL+'/authors');
    const info = await response.json();
    if(response.ok){
        return info;
    }
    else{
        throw info;
    }
}

async function getAuthor(id){
    const response = await fetch(APIURL+'/author/'+id);
    const info = await response.json();
    if(response.ok){
        return info;
    }
    else{
        throw info;
    }
}

// Website
async function getWebName(){
  let response = await fetch(APIURL + '/title');
  const title = await response.json();
  if(response.ok){
      return title.title;
  }
  else{
      throw title;
  }
}

async function setWebName(title){
  let response = await fetch(APIURL + '/title', {
      method: 'PUT',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({title})
  });
  const t = await response.json();
  if(response.ok){
      return title;
  }
  else{
      throw t;
  }
}

// Authentication
async function logIn(credentials){
    let response = await fetch(APIURL + '/sessions', {
        method: 'POST', credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });
    if(response.ok){
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logOut() {
    await fetch(APIURL+'/sessions/current', {
      method: 'DELETE', 
      credentials: 'include' 
    });
}

async function getUserInfo() {
    const response = await fetch(APIURL+'/sessions/current', {
      credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
      return userInfo;
    } else {
      throw userInfo;  
    }
}

export const API = { logIn, logOut, getUserInfo, listPages, authPages, getPage, 
    addPage, getWebName, setWebName, getTitleDates, deletePage, updatePage, getAuthor, getAuthors };