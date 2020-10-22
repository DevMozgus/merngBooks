import React, { useState } from 'react'
import { useMutation } from '@apollo/client';
import { SET_BIRTH } from "../mutations"
import { ALL_AUTHORS } from '../queries';

const SetBirth = ({ authors, setError }) => {
  const [author, setAuthor] = useState("")
  const [year, setYear] = useState('')

  const [ setBirth ] = useMutation(SET_BIRTH, {
    refetchQueries: [ {query: ALL_AUTHORS} ],
    onError: (error) => {     
      setError(error.message)    
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    setBirth({  variables: { author, year: parseInt(year) } })

    setYear('')
    setAuthor('')
  }

  return (
    <div>
      <h2>set birth year</h2>
      <form onSubmit={submit}>
        <div>
          author
          <select value={author} onChange={({ target }) => setAuthor(target.value)}>
            {authors.map(a => {
              return <option key={a.name} value={a.name}>{a.name}</option> 
            })}
          </select>
        </div>
        <div>
          birth year
          <input
            type='number'
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type='submit'>set birth</button>
      </form>
    </div>
  )
}

export default SetBirth