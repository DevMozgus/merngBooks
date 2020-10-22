import React, { useState } from 'react'
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from "../queries"

const Books = (props) => {
  const [genres, setGenres] = useState([])
  const [filter, setFilter] = useState("all")
  const {loading, data, refetch} = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }
  if (loading)  {
    return <div>loading...</div>
  }

  const books = data ? data.allBooks : []

  books.map(book => {
    book.genres.map(genre => {
      if (!genres.includes(genre)) setGenres(genres.concat(genre))
    })
  })

  const newFilter = (genre) => {
    setFilter(genre)
    refetch()
  }

  return (
    <div>
      <h2>books</h2>
      <label>in genre <b>{filter}</b></label>
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
            if(filter === "all" || book.genres.includes(filter)) return  (
                <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
                </tr>
            )}
          )}
        </tbody>
      </table>
      {
        genres.map(genre => 
        <button onClick={() => newFilter(genre)} >{genre}</button>
        )
      }
      <button onClick={() => newFilter("all")} >all genres</button>
    </div>
  )
}

export default Books