import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from "../mutations"

const LoginForm = ({ setError, setToken, show, setPage }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => setError(error.message)
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem("current-user-token", token)
    } // eslint-disable-next-line
  }, [result.data])

  const handleLogin = (event) => {
    event.preventDefault()

    login({ variables: {username, password}})
    setPage("authors")
  }

  if (!show) return null

  return (
    <div>
      <form onSubmit={handleLogin} >
      <label>username</label>
      <input value={username} onChange={({target}) => setUsername(target.value)} />
      <label>password</label>
      <input value={password} onChange={({target}) => setPassword(target.value)} />
      <button type="submit">log in</button>
      </form>
    </div>
  )
}

export default LoginForm