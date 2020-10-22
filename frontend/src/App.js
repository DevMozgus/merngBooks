
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import Recommended from './components/Recommended'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useSubscription } from '@apollo/client';
import { BOOK_ADDED } from './mutations'
import { ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includeIn = (set, object) => 
      set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if(!includeIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook)}
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({subscriptionData}) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.title} has been added`)
      updateCacheWith(addedBook)
    }
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("current-user-token")
    if (storedToken) setToken(storedToken)
  }, [])

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <Notify error={error} setError={setError} />  
      <div>
        { 
        !token ?
        <button onClick={() => setPage('login')}>login</button>
        : 
        <>
        <button onClick={() => handleLogout()} >log out</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>       
        </>
        }
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>       
      </div>

      <LoginForm 
        setError={setError} 
        setToken={setToken} 
        show={page === "login"}
        setPage={setPage}
      />

      <Authors
        show={page === 'authors'}
        setError={setError}
        token={token}
      />

      <Books
        show={page === 'books'}
        setError={setError}
      />

      <Recommended
        show={page === 'recommended'}
        setError={setError}
      />

      <NewBook
        show={page === 'add'}
        setError={setError}
        updateCacheWith={updateCacheWith}
      />

    </div>
  )
}

const Notify = ({error, setError}) => {  
  if (!error) return null   

  setTimeout(() => setError(null), 3000)
  return (    
    <div style={{color: 'red'}}>    
    {error}    
    </div>  
  )
}

export default App