import { gql } from '@apollo/client';

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
      born
      id
    }
    genres
    id
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    id
    bookCount
  }
}
`
export const ALL_BOOKS = gql`
query {
  allBooks  {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`
export const BOOKS_BY_GENRE = gql`
query bookFromGenre($genre: String!) {
  allBooks(genre: $genre)  {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const USER_INFO = gql`
query {
  me {
    username
    favouriteGenre
    id
  }
}
`