import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { setContext } from 'apollo-link-context'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client' 

import { getMainDefinition } from "@apollo/client/utilities"
import { WebSocketLink } from "@apollo/client/link/ws"

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("current-user-token")
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null
    }
  }
})

const httpLink = new HttpLink({ uri: "https://merngbooks.herokuapp.com"})

const wsLink = new WebSocketLink({
  uri: `wss://merngbooks.herokuapp.com/graphql`,
  options: {
    reconnect: true,
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  authLink.concat(httpLink)
)


const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

ReactDOM.render(
  <ApolloProvider client={client}>    
    <App />
  </ApolloProvider>,  
  document.getElementById('root')
)
