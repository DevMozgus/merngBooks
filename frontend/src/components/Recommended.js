import React, { useState } from 'react'
import { useQuery } from '@apollo/client';
import { USER_INFO, BOOKS_BY_GENRE } from "../queries"

const Recommended = ({ show }) => {
  const [books, setBooks] = useState([])

  const userResult = useQuery(USER_INFO, {
    skip: !show
  })
  
  useQuery(BOOKS_BY_GENRE, 
    { skip: !userResult.data, variables: { genre: userResult.data && userResult.data.me.favouriteGenre }, onCompleted: (data) => {
      setBooks(data.allBooks)
    }})


  if (!show) {
    return null
  }
  if (userResult.loading || !books)  {
    return <div>loading...</div>
  }

  const favouriteGenre = userResult.data.me.favouriteGenre


  return (
    <div>
      <h2>books</h2>
      <label>books in your favourite genre <b>{favouriteGenre}</b></label>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(book => {
            return (
            <tr key={book.title}>
            <td>{book.title}</td>
            <td>{book.author.name}</td>
            <td>{book.published}</td>
            </tr>
            ) 
          }
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended