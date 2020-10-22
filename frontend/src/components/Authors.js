import React from 'react'
import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from "../queries"
import SetBirth from "./SetBirth"

const Authors = ({ show, setError, token}) => {
  const result = useQuery(ALL_AUTHORS)

  if (!show) {
    return null
  }
  if (result.loading)  {
    return <div>loading...</div>
  }
  
  const authors = result.data ? result.data.allAuthors : [] 

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {
        token ?
        <SetBirth authors={authors} setError={setError} />
        : null
      }
    </div>
  )
}

export default Authors
