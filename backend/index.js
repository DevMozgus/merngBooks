const { PubSub, ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')
const jwt = require('jsonwebtoken')



const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const pubsub = new PubSub()

const MONGODB_URI = 'url in here'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    ):Book
    addAuthor(
      name: String!
      born: Int
    ):Author
    editAuthor(
      name: String!
      born: Int!
    ):Author
    createUser(
      username: String!
      favouriteGenre: String!
    ):User
    login(
      username: String!
      password: String!
    ):Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, arg) => {
      let books = await Book.find({})
      const author = await Author.findOne({ name: arg.author })
      if (arg.author && arg.genre) {
        books = await Book.find({ author: author.id }, { genres: { $in: [ arg.genre ] }})
      } else if (arg.author) {
        books = await Book.find({ author: author.id })
      } else if (arg.genre) {
        books = await Book.find({ genres: { $in: [ arg.genre ] }})
      }
      books = books.map(async (book) => {
        const author = await Author.findById({ _id: book.author })
        return { ...book._doc, author, id: book._doc._id}
      })
      const updatedBooks = await Promise.all(books)
      return updatedBooks
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const updatedAuthors = await Promise.all(authors.map( async (author) => {
        const bookCount = await Book.find({ author: author.id })
        return { ...author._doc, bookCount: bookCount.length, id: author._doc._id }
      }))
      return updatedAuthors
    }
  },
  Mutation: {
    addAuthor: async (root, arg, context) => {
      if (!context.currentUser) throw new AuthenticationError("not authenticated")

      if (Author.findOne({ name: arg.name })) return null

      const author = new Author({ ...arg })

      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: arg,
        })
      }
      return author
    },
    addBook: async (root, arg, context) => {
      if (!context.currentUser) throw new AuthenticationError("not authenticated")

      const author = await Author.findOne({ name: arg.author })

      if(!author) {
        const newAuthor = new Author({ name: arg.author })
        try {
          await newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: arg
          })
        }
      }

      const updatedAuthor = await Author.findOne({ name: arg.author })
      const book = new Book({ ...arg, author: updatedAuthor })
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: arg
        })
      }

      pubsub.publish("BOOK_ADDED", { bookAdded: book })

      return book
    },
    editAuthor: async (root, arg, context) => {
      if (!context.currentUser) throw new AuthenticationError("not authenticated")

      const author = await Author.findOne({ name: arg.name })

      if (!author) return null

      author.born = arg.born

      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: arg
        })
      }

      return author
    },
    createUser: async (root, arg) => {
      const user = new User({ ...arg })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: arg,
          })
        })
    },
    login: async (root, arg) => {
      const user = await User.findOne({ username: arg.username })

      if (!user || arg.password !== "pass") {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
